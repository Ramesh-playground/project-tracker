import axios from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  Project, 
  Resource, 
  Milestone, 
  Expense, 
  Invoice,
  Dashboard
} from '../types';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<Project> => {
    const response = await api.patch(`/projects/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  getDashboard: async (id: string): Promise<any> => {
    const response = await api.get(`/projects/${id}/dashboard`);
    return response.data;
  },
};

// Resources API
export const resourcesAPI = {
  getAll: async (): Promise<Resource[]> => {
    const response = await api.get('/resources');
    return response.data;
  },

  getById: async (id: string): Promise<Resource> => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  create: async (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'isActive'>): Promise<Resource> => {
    const response = await api.post('/resources', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Resource>): Promise<Resource> => {
    const response = await api.put(`/resources/${id}`, data);
    return response.data;
  },

  deactivate: async (id: string): Promise<void> => {
    await api.patch(`/resources/${id}/deactivate`);
  },

  activate: async (id: string): Promise<void> => {
    await api.patch(`/resources/${id}/activate`);
  },

  allocate: async (id: string, data: {
    projectId: string;
    startDate: string;
    endDate: string;
    allocation: number;
    hourlyRate: number;
  }): Promise<any> => {
    const response = await api.post(`/resources/${id}/allocations`, data);
    return response.data;
  },

  getUtilization: async (id: string, startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/resources/${id}/utilization?${params}`);
    return response.data;
  },
};

// Milestones API
export const milestonesAPI = {
  getAll: async (projectId?: string, status?: string): Promise<Milestone[]> => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (status) params.append('status', status);
    const response = await api.get(`/milestones?${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Milestone> => {
    const response = await api.get(`/milestones/${id}`);
    return response.data;
  },

  create: async (data: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'> & { projectId: string }): Promise<Milestone> => {
    const response = await api.post('/milestones', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Milestone>): Promise<Milestone> => {
    const response = await api.put(`/milestones/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: string, actualDate?: string): Promise<Milestone> => {
    const response = await api.patch(`/milestones/${id}/status`, { status, actualDate });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/milestones/${id}`);
  },

  getByProject: async (projectId: string): Promise<Milestone[]> => {
    const response = await api.get(`/milestones/project/${projectId}`);
    return response.data;
  },

  getTimeline: async (projectId: string): Promise<any> => {
    const response = await api.get(`/milestones/project/${projectId}/timeline`);
    return response.data;
  },

  getDelayed: async (): Promise<any[]> => {
    const response = await api.get('/milestones/delayed/all');
    return response.data;
  },
};

// Financial API
export const financialAPI = {
  getExpenses: async (projectId?: string, category?: string, startDate?: string, endDate?: string): Promise<Expense[]> => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (category) params.append('category', category);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/financial/expenses?${params}`);
    return response.data;
  },

  createExpense: async (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> & { projectId: string }): Promise<Expense> => {
    const response = await api.post('/financial/expenses', data);
    return response.data;
  },

  updateExpense: async (id: string, data: Partial<Expense>): Promise<Expense> => {
    const response = await api.put(`/financial/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/financial/expenses/${id}`);
  },

  getInvoices: async (projectId?: string, status?: string): Promise<Invoice[]> => {
    const params = new URLSearchParams();
    if (projectId) params.append('projectId', projectId);
    if (status) params.append('status', status);
    const response = await api.get(`/financial/invoices?${params}`);
    return response.data;
  },

  createInvoice: async (data: {
    projectId: string;
    milestoneId?: string;
    amount: number;
    issueDate: string;
    dueDate: string;
  }): Promise<Invoice> => {
    const response = await api.post('/financial/invoices', data);
    return response.data;
  },

  updateInvoiceStatus: async (id: string, status: string, paidDate?: string): Promise<Invoice> => {
    const response = await api.patch(`/financial/invoices/${id}/status`, { status, paidDate });
    return response.data;
  },

  getBudgetAnalysis: async (projectId: string): Promise<any> => {
    const response = await api.get(`/financial/budget/${projectId}`);
    return response.data;
  },

  getFinancialSummary: async (): Promise<any> => {
    const response = await api.get('/financial/summary');
    return response.data;
  },

  getOverdueInvoices: async (): Promise<any[]> => {
    const response = await api.get('/financial/invoices/overdue');
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getProjectStatus: async (): Promise<any[]> => {
    const response = await api.get('/reports/project-status');
    return response.data;
  },

  getResourceUtilization: async (startDate?: string, endDate?: string): Promise<any[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/reports/resource-utilization?${params}`);
    return response.data;
  },

  getFinancialSummary: async (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/reports/financial-summary?${params}`);
    return response.data;
  },

  getMilestoneSlippage: async (): Promise<any> => {
    const response = await api.get('/reports/milestone-slippage');
    return response.data;
  },

  getDashboard: async (): Promise<Dashboard> => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  getCustomReport: async (data: {
    projectIds?: string[];
    resourceIds?: string[];
    startDate?: string;
    endDate?: string;
    reportType: string;
    groupBy?: string;
  }): Promise<any> => {
    const response = await api.post('/reports/custom', data);
    return response.data;
  },
};

export default api;