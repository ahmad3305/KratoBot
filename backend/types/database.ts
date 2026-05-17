export interface User {
  user_id: number;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  project_id: number;
  user_id: number;
  project_name: string;
  brand_website: string;
  niche: string | null;
  target_audience: string | null;
  marketing_goals: string | null;
  budget: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface Competitor {
  competitor_id: number;
  project_id: number;
  website_url: string;
  created_at: Date;
}

export interface CompetitorAnalytics {
  analysis_id: number;
  competitor_id: number;
  indexed_pages: number | null;
  backlink_count: number | null;
  authority_score: number | null;
  extracted_keywords: any; // JSON
  sentiment_profile: any; // JSON
  analyzed_at: Date;
}

export interface Report {
  report_id: number;
  project_id: number;
  report_title: string | null;
  report_content: string | null;
  brand_authority_score: number | null;
  avg_competitor_authority: number | null;
  estimated_backlinks: number | null;
  estimated_pages: number | null;
  generated_at: Date;
}