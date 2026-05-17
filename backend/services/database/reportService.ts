import { pool } from "../../config/database";

export async function getReportByProject(project_id: number) {
  const [rows] = await pool.query(
    "SELECT * FROM reports WHERE project_id = ?",
    [project_id]
  );
  return rows;
}

export async function createReport(report: {
  project_id: number;
  report_title?: string;
  report_content?: string;
  brand_authority_score?: number;
  avg_competitor_authority?: number;
  estimated_backlinks?: number;
  estimated_pages?: number;
}) {
  const [result] = await pool.query(
    `INSERT INTO reports 
      (project_id, report_title, report_content, brand_authority_score, avg_competitor_authority, estimated_backlinks, estimated_pages, generated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      report.project_id,
      report.report_title || null,
      report.report_content || null,
      report.brand_authority_score ?? null,
      report.avg_competitor_authority ?? null,
      report.estimated_backlinks ?? null,
      report.estimated_pages ?? null,
    ]
  );
  return result;
}