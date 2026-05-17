import { NextRequest, NextResponse } from "next/server";
import cors from "../../../utils/cors"
import { verifyJWT } from "../../../middleware/auth";
import { pool } from "../../../config/database";
import { runOrchestrator } from "../../../services/orchestrator";

export async function OPTIONS(req: NextRequest) {
  return cors(req);
}

export async function POST(req: NextRequest) {
  let conn = await pool.getConnection();
  try {
    const user = verifyJWT(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // These should match what's sent from the frontend
    const {
      project_id,
      project_name,
      brand_website,
      niche,
      target_audience,
      marketing_goals,
      budget,
      competitors, // array of { competitor_id, website_url }
      report_title
    } = body;

    if (!project_id || !project_name || !brand_website || !Array.isArray(competitors) || competitors.length === 0)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    await conn.beginTransaction();

    // Update the PROJECT row with latest info
    const [upRes]: any = await conn.query(
      `UPDATE Projects SET
        project_name=?, brand_website=?, niche=?, target_audience=?, marketing_goals=?, budget=?, updated_at=NOW()
       WHERE project_id=? AND user_id=?`,
      [project_name, brand_website, niche ?? null, target_audience ?? null, marketing_goals ?? null, budget ?? null, project_id, user.user_id]
    );
    if (upRes.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json({ error: "Project not found or forbidden" }, { status: 404 });
    }

    // Update the COMPETITORS: remove old, insert new (simple replace approach)
    await conn.query(`DELETE FROM Competitors WHERE project_id=?`, [project_id]);
    for (const c of competitors) {
      if (!c.website_url) continue;
      await conn.query(
        `INSERT INTO Competitors (project_id, website_url) VALUES (?, ?)`,
        [project_id, c.website_url]
      );
    }

    // Re-select competitors so we have correct competitor_ids for orchestrator
    const [dbCompetitors]: any = await conn.query(
      "SELECT competitor_id, website_url as domain FROM Competitors WHERE project_id = ?",
      [project_id]
    );

    // Create a new REPORT row in processing status
    const [reportRes]: any = await conn.query(
      `INSERT INTO Reports (
        project_id, report_title, report_content, brand_authority_score, estimated_backlinks, extracted_keywords, sentiment_score, status
      ) VALUES (?, ?, '', 0, 0, '[]', 0, 'processing')`,
      [
        project_id,
        report_title || `Analysis for ${project_name}`,
      ]
    );
    const report_id = reportRes.insertId;

    await conn.commit();
    conn.release();

    // Fire orchestrator in the background
    runOrchestrator({
      project_id,
      report_id,
      brandDomain: brand_website.replace(/^https?:\/\//, ""), // sends only the domain part
      brandCompetitorArr: dbCompetitors.map((c: any) => ({
        domain: c.domain.replace(/^https?:\/\//, ""),
        competitor_id: c.competitor_id,
      })),
      report_title: report_title || `Analysis for ${project_name}`,
    });

    return NextResponse.json({ message: "Analysis started", report_id }, { status: 202 });
  } catch (e: any) {
    if (conn) await conn.rollback();
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  } finally {
    if (conn) conn.release();
  }
}