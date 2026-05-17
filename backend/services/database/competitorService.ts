import { pool } from "../../config/database";

export async function getCompetitorsByProject(project_id: number) {
  const [rows] = await pool.query(
    "SELECT * FROM competitors WHERE project_id = ?",
    [project_id]
  );
  return rows;
}

export async function addCompetitor(competitor: {
  project_id: number;
  website_url: string;
}) {
  const [result] = await pool.query(
    "INSERT INTO competitors (project_id, website_url) VALUES (?, ?)",
    [competitor.project_id, competitor.website_url]
  );
  return result;
}