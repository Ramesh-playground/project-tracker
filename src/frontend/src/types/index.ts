export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'RESOURCE_MANAGER' | 'FINANCE_MANAGER' | 'EXECUTIVE';

export interface Project {
  id: string;
  name: string;
  projectId: string;
  description?: string;
  poNumber: string;
  poDate: string;
  poAmount: number;
  clientName: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  user?: {
    name: string;
    email: string;
  };
  milestones?: Milestone[];
  allocations?: ResourceAllocation[];
  expenses?: Expense[];
  invoices?: Invoice[];
}

export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

export interface Resource {
  id: string;
  resourceId: string;
  name: string;
  email: string;
  phone?: string;
  salary?: number;
  hourlyRate?: number;
  yearsOfExp: number;
  skills: string[];
  certifications?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  user?: {
    name: string;
    email: string;
  };
  allocations?: ResourceAllocation[];
  currentUtilization?: number;
}

export interface ResourceAllocation {
  id: string;
  startDate: string;
  endDate: string;
  allocation: number;
  hourlyRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: {
    name: string;
    projectId: string;
    status: ProjectStatus;
  };
  resourceId: string;
  resource?: {
    name: string;
    resourceId: string;
  };
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  scheduledDate: string;
  actualDate?: string;
  isBillingMilestone: boolean;
  billingAmount?: number;
  billingPercentage?: number;
  status: MilestoneStatus;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: {
    name: string;
    projectId: string;
  };
  invoices?: Invoice[];
}

export type MilestoneStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: {
    name: string;
    projectId: string;
  };
}

export type ExpenseCategory = 'RESOURCE_COST' | 'LICENSE' | 'INFRASTRUCTURE' | 'TRAVEL' | 'MATERIAL' | 'OTHER';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: {
    name: string;
    projectId: string;
  };
  milestoneId?: string;
  milestone?: {
    name: string;
  };
}

export type InvoiceStatus = 'PENDING' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Dashboard {
  metrics: {
    projects: {
      total: number;
      active: number;
      overBudget: number;
    };
    resources: {
      total: number;
    };
    milestones: {
      total: number;
      delayed: number;
    };
    financial: {
      totalBudget: number;
      totalExpenses: number;
      totalInvoiced: number;
      overdueInvoices: number;
    };
  };
  recentActivity: {
    projects: Array<{
      id: string;
      name: string;
      status: ProjectStatus;
      createdAt: string;
    }>;
    milestones: Array<{
      id: string;
      name: string;
      status: MilestoneStatus;
      project: { name: string };
    }>;
  };
  alerts: {
    delayedMilestones: boolean;
    overdueInvoices: boolean;
    overBudgetProjects: boolean;
  };
}