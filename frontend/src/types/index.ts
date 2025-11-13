// User types
export enum UserRole {
  SALES = 'sales',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  team?: Team;
  created_at: string;
  updated_at: string;
}

// Team types
export interface Team {
  id: string;
  name: string;
  description?: string;
  manager?: User;
  members?: User[];
  created_at: string;
  updated_at: string;
}

// Opportunity types
export enum OpportunityStatus {
  ACTIVE = 'Active',
  WON = 'Won',
  LOST = 'Lost',
  ON_HOLD = 'On Hold',
  CANCELLED = 'Cancelled',
}

export enum OpportunityStage {
  PROSPECTION = 'Prospection',
  QUALIFICATION = 'Qualification',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED = 'Closed',
}

export interface Opportunity {
  id: string;
  project_name: string;
  service_type: string;
  sector_type: string;
  original_amount: number;
  project_maturity: string;
  client_type: string;
  client_relationship: string;
  conservative_approach: boolean;
  probability_score: number;
  weighted_amount: number;
  starting_date?: string;
  closing_date?: string;
  status: OpportunityStatus;
  stage: OpportunityStage;
  notes?: string;
  owner: User;
  client?: ClientCompany;
  revenue_distribution?: RevenueDistribution[];
  activities?: Activity[];
  created_at: string;
  updated_at: string;
}

// Client Company types
export interface ClientCompany {
  id: string;
  name: string;
  industry?: string;
  relationship_tier: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Revenue Distribution types
export interface RevenueDistribution {
  id: string;
  year: number;
  month: number;
  sales_amount: number;
  gross_margin_amount: number;
  opportunity: Opportunity;
}

// Activity types
export interface Activity {
  id: string;
  activity_type: string;
  description: string;
  old_value?: any;
  new_value?: any;
  user: User;
  opportunity: Opportunity;
  created_at: string;
}

// Dashboard types
export interface DashboardMetrics {
  total_opportunities: number;
  active_opportunities: number;
  won_opportunities: number;
  lost_opportunities: number;
  pipeline_value: number;
  weighted_pipeline_value: number;
  won_value: number;
  win_rate: number;
  average_deal_size: number;
}

export interface OpportunityBreakdown {
  stage?: string;
  status?: string;
  count: number;
  total_value: number;
}

export interface MonthlyForecast {
  year: number;
  month: number;
  sales_amount: number;
  gross_margin_amount: number;
}

export interface IndividualDashboard {
  user: {
    id: string;
    name: string;
    email: string;
    team?: string;
  };
  metrics: DashboardMetrics;
  opportunities_by_stage: OpportunityBreakdown[];
  opportunities_by_status: OpportunityBreakdown[];
  monthly_forecast: MonthlyForecast[];
  recent_activities: Activity[];
}

export interface MemberPerformance {
  user_id: string;
  name: string;
  opportunities_count: number;
  pipeline_value: number;
  won_count: number;
  won_value: number;
}

export interface TeamDashboard {
  team: {
    id: string;
    name: string;
    manager: string;
  };
  metrics: DashboardMetrics & { total_members: number };
  members_performance: MemberPerformance[];
  opportunities_by_stage: OpportunityBreakdown[];
  opportunities_by_status: OpportunityBreakdown[];
  monthly_forecast: MonthlyForecast[];
}

export interface TeamPerformance {
  team_id: string;
  team_name: string;
  members_count: number;
  opportunities_count: number;
  pipeline_value: number;
  won_count: number;
  won_value: number;
}

export interface GlobalDashboard {
  metrics: DashboardMetrics & { total_users: number; total_teams: number };
  teams_performance: TeamPerformance[];
  opportunities_by_stage: OpportunityBreakdown[];
  opportunities_by_status: OpportunityBreakdown[];
  monthly_forecast: MonthlyForecast[];
  recent_activities: Activity[];
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

// Filter types
export interface OpportunityFilters {
  status?: OpportunityStatus;
  stage?: OpportunityStage;
  owner_id?: string;
  team_id?: string;
  service_type?: string;
  sector_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}
