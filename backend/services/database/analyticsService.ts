import { pool } from "../../config/database";

export async function getAnalyticsByCompetitor(competitor_id: number) {
  const [rows] = await pool.query(
    "SELECT * FROM competitor_analytics WHERE competitor_id = ?",
    [competitor_id]
  );
  return rows;
}

export async function addCompetitorAnalytics(analytics: {
  competitor_id: number;
  indexed_pages?: number;
  backlink_count?: number;
  authority_score?: number;
  extracted_keywords?: any;
  sentiment_profile?: any;
}) {
  const [result] = await pool.query(
    `INSERT INTO competitor_analytics 
      (competitor_id, indexed_pages, backlink_count, authority_score, extracted_keywords, sentiment_profile, analyzed_at) 
     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      analytics.competitor_id,
      analytics.indexed_pages ?? null,
      analytics.backlink_count ?? null,
      analytics.authority_score ?? null,
      JSON.stringify(analytics.extracted_keywords || {}),
      JSON.stringify(analytics.sentiment_profile || {}),
    ]
  );
  return result;
}