import { useState, useEffect, useCallback } from 'react';
import { User, AuthState, LoginCredentials, CreateAccountData } from '../types/auth';
import { generateMockUser, validateCredentials, createUser } from '../utils/authSimulator';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const savedUser = localStorage.getItem('cyberguard_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          localStorage.removeItem('cyberguard_user');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkExistingSession();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const validation = validateCredentials(credentials);
      
      if (validation.success && validation.user) {
        const updatedUser = { ...validation.user, lastLogin: new Date() };
        
        localStorage.setItem('cyberguard_user', JSON.stringify(updatedUser));
        
        setAuthState({
          user: updatedUser,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: validation.error || 'Invalid credentials' };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const createAccount = useCallback(async (accountData: CreateAccountData): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = createUser(accountData);
      
      if (result.success && result.user) {
        // Auto-login after successful account creation
        localStorage.setItem('cyberguard_user', JSON.stringify(result.user));
        
        setAuthState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error || 'Account creation failed' };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Account creation failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cyberguard_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  const hasPermission = useCallback((permissionName: string): boolean => {
    if (!authState.user) return false;
    return authState.user.permissions.some(p => p.name === permissionName);
  }, [authState.user]);

  const isAdmin = useCallback((): boolean => {
    return authState.user?.role === 'admin' || false;
  }, [authState.user]);

  return {
    ...authState,
    login,
    createAccount,
    logout,
    hasPermission,
    isAdmin
  };
}