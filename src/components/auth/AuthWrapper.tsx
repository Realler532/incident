import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Dashboard } from '../Dashboard';
import { Loader2 } from 'lucide-react';

export function AuthWrapper() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading CyberGuard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showSignup ? (
      <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  return <Dashboard />;
}