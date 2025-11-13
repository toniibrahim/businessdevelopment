import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  User,
  Team,
  Opportunity,
  ClientCompany,
  IndividualDashboard,
  TeamDashboard,
  GlobalDashboard,
  PaginatedResponse,
  OpportunityFilters,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken,
              });

              const { access_token, refresh_token: newRefreshToken } = response.data;
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('refresh_token', newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    await this.api.post('/auth/logout', { refresh_token: refreshToken });
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/auth/me');
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await this.api.post('/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await this.api.post('/auth/reset-password', data);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.api.post('/users/me/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  // User endpoints
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    team_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await this.api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.api.get<User>(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await this.api.put<User>(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.api.put<User>('/users/me', data);
    return response.data;
  }

  async getUserStats(id: string): Promise<any> {
    const response = await this.api.get(`/users/${id}/stats`);
    return response.data;
  }

  // Team endpoints
  async getTeams(): Promise<{ items: Team[]; total: number }> {
    const response = await this.api.get('/teams');
    return response.data;
  }

  async getTeamById(id: string): Promise<Team> {
    const response = await this.api.get<Team>(`/teams/${id}`);
    return response.data;
  }

  async createTeam(data: Partial<Team>): Promise<Team> {
    const response = await this.api.post<Team>('/teams', data);
    return response.data;
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
    const response = await this.api.put<Team>(`/teams/${id}`, data);
    return response.data;
  }

  async deleteTeam(id: string): Promise<void> {
    await this.api.delete(`/teams/${id}`);
  }

  async getTeamMembers(id: string): Promise<{ items: User[]; total: number }> {
    const response = await this.api.get(`/teams/${id}/members`);
    return response.data;
  }

  async getTeamStats(id: string): Promise<any> {
    const response = await this.api.get(`/teams/${id}/stats`);
    return response.data;
  }

  // Opportunity endpoints
  async getOpportunities(
    filters?: OpportunityFilters
  ): Promise<PaginatedResponse<Opportunity>> {
    const response = await this.api.get<PaginatedResponse<Opportunity>>(
      '/opportunities',
      { params: filters }
    );
    return response.data;
  }

  async getOpportunityById(id: string): Promise<Opportunity> {
    const response = await this.api.get<Opportunity>(`/opportunities/${id}`);
    return response.data;
  }

  async createOpportunity(data: Partial<Opportunity>): Promise<Opportunity> {
    const response = await this.api.post<Opportunity>('/opportunities', data);
    return response.data;
  }

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    const response = await this.api.put<Opportunity>(`/opportunities/${id}`, data);
    return response.data;
  }

  async deleteOpportunity(id: string): Promise<void> {
    await this.api.delete(`/opportunities/${id}`);
  }

  async duplicateOpportunity(id: string): Promise<Opportunity> {
    const response = await this.api.post<Opportunity>(`/opportunities/${id}/duplicate`);
    return response.data;
  }

  async updateOpportunityStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<Opportunity> {
    const response = await this.api.put<Opportunity>(`/opportunities/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  }

  async getOpportunityActivities(id: string): Promise<any> {
    const response = await this.api.get(`/opportunities/${id}/activities`);
    return response.data;
  }

  async addOpportunityActivity(id: string, data: any): Promise<any> {
    const response = await this.api.post(`/opportunities/${id}/activities`, data);
    return response.data;
  }

  async getOpportunityRevenueDistribution(id: string): Promise<any> {
    const response = await this.api.get(`/opportunities/${id}/revenue-distribution`);
    return response.data;
  }

  async bulkUpdateOpportunities(ids: string[], data: any): Promise<void> {
    await this.api.post('/opportunities/bulk-update', { ids, updates: data });
  }

  // Client endpoints
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<ClientCompany>> {
    const response = await this.api.get<PaginatedResponse<ClientCompany>>(
      '/clients',
      { params }
    );
    return response.data;
  }

  async getClientById(id: string): Promise<ClientCompany> {
    const response = await this.api.get<ClientCompany>(`/clients/${id}`);
    return response.data;
  }

  async createClient(data: Partial<ClientCompany>): Promise<ClientCompany> {
    const response = await this.api.post<ClientCompany>('/clients', data);
    return response.data;
  }

  async updateClient(id: string, data: Partial<ClientCompany>): Promise<ClientCompany> {
    const response = await this.api.put<ClientCompany>(`/clients/${id}`, data);
    return response.data;
  }

  async deleteClient(id: string): Promise<void> {
    await this.api.delete(`/clients/${id}`);
  }

  async getClientStats(id: string): Promise<any> {
    const response = await this.api.get(`/clients/${id}/stats`);
    return response.data;
  }

  // Dashboard endpoints
  async getIndividualDashboard(userId?: string): Promise<IndividualDashboard> {
    const url = userId ? `/dashboard/individual/${userId}` : '/dashboard/individual';
    const response = await this.api.get<IndividualDashboard>(url);
    return response.data;
  }

  async getTeamDashboard(teamId?: string): Promise<TeamDashboard> {
    const url = teamId ? `/dashboard/team/${teamId}` : '/dashboard/team';
    const response = await this.api.get<TeamDashboard>(url);
    return response.data;
  }

  async getGlobalDashboard(): Promise<GlobalDashboard> {
    const response = await this.api.get<GlobalDashboard>('/dashboard/global');
    return response.data;
  }

  // Export endpoints
  async exportOpportunitiesToExcel(filters?: OpportunityFilters): Promise<Blob> {
    const response = await this.api.get('/export/opportunities/excel', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  async exportOpportunitiesToCSV(filters?: OpportunityFilters): Promise<Blob> {
    const response = await this.api.get('/export/opportunities/csv', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  async exportRevenueDistribution(filters?: OpportunityFilters): Promise<Blob> {
    const response = await this.api.get('/export/revenue-distribution/excel', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  // Helper methods
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default new ApiService();
