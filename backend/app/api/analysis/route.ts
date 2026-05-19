
import { NextRequest, NextResponse } from "next/server";
import cors, { withCors } from "../../../utils/cors";
import { verifyJWT } from "../../../middleware/auth";
import { pool } from "../../../config/database";
import { runOrchestrator } from "../../../services/orchestrator";

export const OPTIONS = cors;

function normalizeBudget(value: any) {
  if (value === "" || value === undefined || value === null) return null;
  const num = Number(value);
  return isNaN(num) ? null : num;
}

export const POST = withCors(async function (req: NextRequest) {
  let conn = await pool.getConnection();

  try {
    const user = await verifyJWT(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      project_id,
      project_name,
      brand_website,
      niche,
      target_audience,
      marketing_goals,
      budget,
      competitors,
      report_title
    } = body;

    if (
      !project_id ||
      !project_name ||
      !brand_website ||
      !Array.isArray(competitors) ||
      competitors.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await conn.beginTransaction();

    const [upRes]: any = await conn.query(
    `UPDATE Projects SET
      project_name=?, brand_website=?, niche=?, target_audience=?, marketing_goals=?, budget=?, updated_at=NOW()
    WHERE project_id=? AND user_id=?`,
    [
      project_name,
      brand_website,
      niche ?? null,
      target_audience ?? null,
      marketing_goals ?? null,
      normalizeBudget(budget),
      project_id,
      user.user_id,
    ]
  );

    if (upRes.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json(
        { error: "Project not found or forbidden" },
        { status: 404 }
      );
    }

    await conn.query(`DELETE FROM Competitors WHERE project_id=?`, [
      project_id,
    ]);

    for (const c of competitors) {
      if (!c.website_url) continue;

      await conn.query(
        `INSERT INTO Competitors (project_id, website_url) VALUES (?, ?)`,
        [project_id, c.website_url]
      );
    }

    const [dbCompetitors]: any = await conn.query(
      "SELECT competitor_id, website_url as domain FROM Competitors WHERE project_id = ?",
      [project_id]
    );

    const [reportRes]: any = await conn.query(
      `INSERT INTO Reports (
        project_id, report_title, report_content,
        brand_authority_score, estimated_backlinks,
        extracted_keywords, sentiment_score, status
      ) VALUES (?, ?, '', 0, 0, '[]', 0, 'processing')`,
      [project_id, report_title || `Analysis for ${project_name}`]
    );

    const report_id = reportRes.insertId;

    await conn.commit();

    runOrchestrator({
      project_id,
      report_id,
      brandDomain: brand_website.replace(/^https?:\/\//, ""),
      brandCompetitorArr: dbCompetitors.map((c: any) => ({
        domain: c.domain.replace(/^https?:\/\//, ""),
        competitor_id: c.competitor_id,
      })),
      report_title: report_title || `Analysis for ${project_name}`,
    });

    return NextResponse.json(
      { message: "Analysis started", report_id },
      { status: 202 }
    );
  } catch (e: any) {
    await conn.rollback();
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
});