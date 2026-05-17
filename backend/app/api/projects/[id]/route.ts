import { NextRequest, NextResponse } from "next/server";
import cors, { withCors } from "../../../../utils/cors";
import { verifyJWT } from "../../../../middleware/auth";
import { pool } from "../../../../config/database";

function getProjectId(req: NextRequest): number | null {
  const id = req.nextUrl.pathname.split("/").filter(Boolean).pop();
  return id && !isNaN(Number(id)) ? Number(id) : null;
}

export const OPTIONS = cors;

export const GET = withCors(async function (req: NextRequest) {
  try {
    const user = await verifyJWT(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project_id = getProjectId(req);
    if (!project_id) return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

    // Get project and its competitors
    const [projects]: any = await pool.query(
      "SELECT * FROM Projects WHERE project_id = ? AND user_id = ? LIMIT 1",
      [project_id, user.user_id]
    );
    if (!projects[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [competitors] = await pool.query(
      "SELECT * FROM Competitors WHERE project_id = ? ORDER BY created_at ASC",
      [project_id]
    );
    projects[0].competitors = competitors;

    return NextResponse.json({ project: projects[0] }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});

export const PUT = withCors(async function (req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const user = await verifyJWT(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project_id = getProjectId(req);
    if (!project_id) return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

    const body = await req.json();
    const { project_name, brand_website, niche, target_audience, marketing_goals, budget, competitors } = body;

    await conn.beginTransaction();

    // 1. Update project
    const [updateResult]: any = await conn.query(
      `UPDATE Projects SET
        project_name = ?, brand_website = ?, niche = ?, target_audience = ?, marketing_goals = ?, budget = ?, updated_at = NOW()
        WHERE project_id = ? AND user_id = ?`,
      [project_name, brand_website, niche ?? null, target_audience ?? null, marketing_goals ?? null, budget ?? null, project_id, user.user_id]
    );
    if (updateResult.affectedRows === 0) throw new Error("Not found");

    // 2. Sync competitors table (delete all then re-insert for simplicity & integrity)
    await conn.query(`DELETE FROM Competitors WHERE project_id = ?`, [project_id]);
    if (Array.isArray(competitors)) {
      for (const item of competitors) {
        if (item.website_url) {
          await conn.query(
            `INSERT INTO Competitors (project_id, website_url) VALUES (?, ?)`,
            [project_id, item.website_url]
          );
        }
      }
    }

    await conn.commit();
    return NextResponse.json({ message: "Project and competitors updated" }, { status: 200 });
  } catch (e: any) {
    await conn.rollback();
    return NextResponse.json({ error: e.message || "Server error" }, { status: e.message === "Not found" ? 404 : 500 });
  } finally {
    conn.release();
  }
});

export const DELETE = withCors(async function (req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const user = await verifyJWT(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project_id = getProjectId(req);
    if (!project_id) return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });

    await conn.beginTransaction();
    // Delete competitors first due to FK, but ON DELETE CASCADE is set so Projects delete is enough.
    const [delResult]: any = await conn.query(
      `DELETE FROM Projects WHERE project_id = ? AND user_id = ?`,
      [project_id, user.user_id]
    );
    if (delResult.affectedRows === 0) throw new Error("Not found");

    await conn.commit();
    return NextResponse.json({ message: "Project deleted" }, { status: 200 });
  } catch (e: any) {
    await conn.rollback();
    return NextResponse.json({ error: e.message || "Server error" }, { status: e.message === "Not found" ? 404 : 500 });
  } finally {
    conn.release();
  }
});