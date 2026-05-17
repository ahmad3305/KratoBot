import { NextRequest, NextResponse } from "next/server";
import cors, { withCors } from "../../../utils/cors";
import { verifyJWT } from "../../../middleware/auth";
import { pool } from "../../../config/database";

export const OPTIONS = cors;

export const GET = withCors(async function (req: NextRequest) {
  try {
    const user = verifyJWT(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get all projects for user with competitors
    const [projects] = await pool.query(
      `SELECT * FROM Projects WHERE user_id = ? ORDER BY created_at DESC`,
      [user.user_id]
    );

    for (const project of projects as any[]) {
      const [competitors] = await pool.query(
        "SELECT * FROM Competitors WHERE project_id = ? ORDER BY created_at ASC",
        [project.project_id]
      );
      project.competitors = competitors;
    }

    return NextResponse.json({ projects }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
});

export const POST = withCors(async function (req: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const user = verifyJWT(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { project_name, brand_website, niche, target_audience, marketing_goals, budget, competitors } = body;

    if (!project_name || !brand_website) {
      return NextResponse.json({ error: "project_name and brand_website required" }, { status: 400 });
    }

    await conn.beginTransaction();

    // 1. Create project
    const [result]: any = await conn.query(
      `INSERT INTO Projects (user_id, project_name, brand_website, niche, target_audience, marketing_goals, budget)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.user_id, project_name, brand_website, niche ?? null, target_audience ?? null, marketing_goals ?? null, budget ?? null]
    );
    const project_id = result.insertId;

    // 2. Create competitors
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

    return NextResponse.json({ message: "Project and competitors created", project_id }, { status: 201 });
  } catch (e) {
    await conn.rollback();
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    conn.release();
  }
});