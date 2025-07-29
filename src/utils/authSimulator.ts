import { User, LoginCredentials, CreateAccountData, Permission } from '../types/auth';

// Mock permissions database
const permissions: Permission[] = [
  { id: 'view_incidents', name: 'view_incidents', description: 'View security incidents', category: 'incidents' },
  { id: 'manage_incidents', name: 'manage_incidents', description: 'Create and manage incidents', category: 'incidents' },
  { id: 'resolve_incidents', name: 'resolve_incidents', description: 'Resolve security incidents', category: 'incidents' },
  { id: 'view_alerts', name: 'view_alerts', description: 'View security alerts', category: 'alerts' },
  { id: 'manage_alerts', name: 'manage_alerts', description: 'Acknowledge and manage alerts', category: 'alerts' },
  { id: 'view_systems', name: 'view_systems', description: 'View system status', category: 'systems' },
  { id: 'manage_systems', name: 'manage_systems', description: 'Manage system configurations', category: 'systems' },
  { id: 'view_users', name: 'view_users', description: 'View user accounts', category: 'users' },
  { id: 'manage_users', name: 'manage_users', description: 'Create and manage user accounts', category: 'users' },
  { id: 'view_reports', name: 'view_reports', description: 'View security reports', category: 'reports' },
  { id: 'generate_reports', name: 'generate_reports', description: 'Generate security reports', category: 'reports' }
];

// Mock users database
const mockUsers: User[] = [
  {
    id: 'admin-001',
    email: 'admin@cyberguard.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    department: 'IT Security',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
    isActive: true,
    permissions: permissions
  }
];

// Mock passwords (in real app, these would be hashed)
const mockPasswords: Record<string, string> = {
  'admin@cyberguard.com': 'admin123'
};

const rolePermissions: Record<string, string[]> = {
  admin: permissions.map(p => p.name),
  analyst: ['view_incidents', 'manage_incidents', 'resolve_incidents', 'view_alerts', 'manage_alerts', 'view_systems', 'view_reports'],
  viewer: ['view_incidents', 'view_alerts', 'view_systems', 'view_reports']
};

export function generateMockUser(): User {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: 'demo@cyberguard.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'admin',
    department: 'IT Security',
    createdAt: new Date(),
    isActive: true,
    permissions: permissions
  };
}

export function validateCredentials(credentials: LoginCredentials): { success: boolean; user?: User; error?: string } {
  const user = mockUsers.find(u => u.email === credentials.email);
  
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (!user.isActive) {
    return { success: false, error: 'Account is deactivated' };
  }

  const storedPassword = mockPasswords[credentials.email];
  if (storedPassword !== credentials.password) {
    return { success: false, error: 'Invalid password' };
  }

  return { success: true, user };
}

export function createUser(accountData: CreateAccountData): { success: boolean; user?: User; error?: string } {
  // Validate input
  if (!accountData.email || !accountData.password || !accountData.firstName || !accountData.lastName) {
    return { success: false, error: 'All fields are required' };
  }

  if (accountData.password !== accountData.confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }

  if (accountData.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long' };
  }

  // Check if email already exists
  if (mockUsers.some(u => u.email === accountData.email)) {
    return { success: false, error: 'Email already exists' };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(accountData.email)) {
    return { success: false, error: 'Invalid email format' };
  }

  // Get permissions for role
  const userPermissions = rolePermissions[accountData.role] || [];
  const permissionObjects = permissions.filter(p => userPermissions.includes(p.name));

  // Create new user
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: accountData.email,
    firstName: accountData.firstName,
    lastName: accountData.lastName,
    role: accountData.role,
    department: accountData.department,
    createdAt: new Date(),
    isActive: true,
    permissions: permissionObjects
  };

  // Add to mock database
  mockUsers.push(newUser);
  mockPasswords[accountData.email] = accountData.password;

  return { success: true, user: newUser };
}

export function getAllUsers(): User[] {
  return mockUsers;
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find(u => u.id === id);
}

export function updateUser(id: string, updates: Partial<User>): { success: boolean; user?: User; error?: string } {
  const userIndex = mockUsers.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
  return { success: true, user: mockUsers[userIndex] };
}

export function deleteUser(id: string): { success: boolean; error?: string } {
  const userIndex = mockUsers.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  const user = mockUsers[userIndex];
  delete mockPasswords[user.email];
  mockUsers.splice(userIndex, 1);
  
  return { success: true };
}