import React, { useState } from 'react';
import { User, Settings, LogOut, Shield, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function UserProfile() {
  const { user, logout, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'analyst':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'viewer':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-400">{user.role}</p>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 rounded-xl border border-gray-700 shadow-xl z-50">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              {isAdmin() && (
                <div className="flex items-center text-xs text-yellow-400">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin Access
                </div>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-gray-400 mb-1">Department</div>
                <div className="text-white">{user.department}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Permissions</div>
                <div className="text-white">{user.permissions.length}</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center text-gray-400">
                <Calendar className="h-3 w-3 mr-2" />
                Joined {user.createdAt.toLocaleDateString()}
              </div>
              {user.lastLogin && (
                <div className="flex items-center text-gray-400">
                  <Clock className="h-3 w-3 mr-2" />
                  Last login {user.lastLogin.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-700 p-2">
            <button
              onClick={() => {
                setShowDropdown(false);
                // Add settings functionality here
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </button>
            <button
              onClick={() => {
                setShowDropdown(false);
                logout();
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}