export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'analyst' | 'viewer';
  department: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'incidents' | 'alerts' | 'systems' | 'users' | 'reports';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateAccountData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'analyst' | 'viewer';
  department: string;
}