import { NextRequest, NextResponse } from "next/server";
import cors from "../../../../utils/cors";
import { verifyJWT } from "../../../../middleware/auth";
import { pool } from "../../../../config/database";

function getReportId(req: NextRequest): number | null {
  const id = req.nextUrl.pathname.split("/").filter(Boolean).pop();
  return id && !isNaN(Number(id)) ? Number(id) : null;
}

export async function OPTIONS(req: NextRequest) {
  return cors(req);
}

export async function GET(req: NextRequest) {
  try {
    const user = verifyJWT(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const report_id = getReportId(req);
    if (!report_id) return NextResponse.json({ error: "Invalid report ID" }, { status: 400 });

    // Fetch report data + join project to enforce ownership
    const [[report]]: any = await pool.query(
      `SELECT 
         r.report_id, r.project_id, r.report_title, r.report_content, r.status, r.generated_at,
         r.brand_authority_score, r.estimated_backlinks, r.extracted_keywords, r.sentiment_score,
         p.project_name, p.brand_website
       FROM Reports r
       INNER JOIN Projects p ON r.project_id = p.project_id
       WHERE r.report_id = ? AND p.user_id = ?
       LIMIT 1`,
      [report_id, user.user_id]
    );
    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Get all current competitors for the project
    const [competitors]: any = await pool.query(
      `SELECT competitor_id, website_url as domain FROM Competitors WHERE project_id = ?`,
      [report.project_id]
    );

    // Get all competitor analytics for these competitors and this report/project
    // (If you store analytics per project_id/report_id, add in WHERE clause)
    const competitorIds = competitors.map((c: any) => c.competitor_id);
    let competitorAnalytics: any[] = [];
    if (competitorIds.length) {
    const placeholders = competitorIds.map(() => '?').join(',');
    const [rows] = await pool.query(
        `SELECT 
        ca.*, c.website_url as domain
        FROM Competitor_Analytics ca
        INNER JOIN Competitors c ON ca.competitor_id = c.competitor_id
        WHERE ca.competitor_id IN (${placeholders})
        ORDER BY ca.analyzed_at DESC`,
        competitorIds
    );
    competitorAnalytics = rows as any[]; 
}

    // Ready for frontend: report fields + all analytics per competitor
    return NextResponse.json({
      report: {
        ...report,
        extracted_keywords: JSON.parse(report.extracted_keywords || "[]"),
        competitors: competitors,
        competitor_analytics: competitorAnalytics
      }
    }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}