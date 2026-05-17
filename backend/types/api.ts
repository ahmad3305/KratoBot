// User registration
export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    user_id: number;
    full_name: string;
    email: string;
  };
}

// Project
export interface CreateProjectRequest {
  project_name: string;
  brand_website: string;
  niche?: string;
  target_audience?: string;
  marketing_goals?: string;
  budget?: number;
  competitors?: string[]; // URLs
}

export interface UpdateProjectRequest {
  project_name?: string;
  brand_website?: string;
  niche?: string;
  target_audience?: string;
  marketing_goals?: string;
  budget?: number;
}

// Generic API response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}