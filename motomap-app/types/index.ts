export type RiskLevel = 'SAFE' | 'CAUTION' | 'STOP';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface ApiResponse<T> {
  data: T;
  meta: { version: string; timestamp: string };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    version: string;
    timestamp: string;
    page: number;
    per_page: number;
    total: number;
  };
}

export interface Bike {
  id: string;
  make: string;
  model: string;
  year_start: number;
  year_end: number | null;
  variant: string | null;
  is_active: boolean;
}

export interface Part {
  id: string;
  bike_id: string;
  name: string;
  category: string;
  function: string;
  failure_consequences: string;
  risk_level: RiskLevel;
  diy_fixable: boolean;
  quick_fix: string | null;
  cost_range_min: number | null;
  cost_range_max: number | null;
  is_risk_approved: boolean;
}

export interface PartConnection {
  id: string;
  from_part_id: string;
  to_part_id: string;
  connection_type: string;
  connected_part: Part | null;
}

export interface GuideStep {
  id: string;
  guide_id: string;
  step_number: number;
  title: string;
  description: string;
  photo_url: string | null;
  warning: string | null;
}

export interface Guide {
  id: string;
  bike_id: string;
  part_id: string;
  title: string;
  difficulty: Difficulty;
  estimated_minutes: number | null;
  tools_required: string[] | null;
  is_published: boolean;
  steps?: GuideStep[];
}

export interface DiagnosedPart {
  part_id: string | null;
  name: string;
  issue: string;
  severity: RiskLevel;
  confidence: number;
}

export interface DiagnosisResult {
  diagnosis_id: string;
  bike_id: string;
  overall_confidence: number;
  safe_to_ride: boolean | null;
  low_confidence_warning: string | null;
  diagnosed_parts: DiagnosedPart[];
  mechanic_prompt: string | null;
  raw_analysis: string;
}

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  user: AuthUser;
}
