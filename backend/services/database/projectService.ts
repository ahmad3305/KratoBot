import { pool } from "../../config/database";

export async function getProjectsByUser(user_id: number) {
  const [rows] = await pool.query("SELECT * FROM projects WHERE user_id = ?", [user_id]);
  return rows;
}

export async function createProject(project: {
  user_id: number;
  project_name: string;
  brand_website: string;
  niche?: string;
  target_audience?: string;
  marketing_goals?: string;
  budget?: number;
}) {
  const [result] = await pool.query(
    "INSERT INTO projects (user_id, project_name, brand_website, niche, target_audience, marketing_goals, budget) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      project.user_id,
      project.project_name,
      project.brand_website,
      project.niche || null,
      project.target_audience || null,
      project.marketing_goals || null,
      project.budget || null,
    ]
  );
  return result;
}