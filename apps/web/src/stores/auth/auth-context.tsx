'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../../lib/api';
import { User, AuthResponse } from '@real-estate-analyzer/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, organizationName?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response: AuthResponse = await authApi.login({ email, password });
    setUser(response.user);
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    organizationName?: string
  ) => {
    const response: AuthResponse = await authApi.register({
      email,
      password,
      firstName,
      lastName,
      organizationName,
    });
    setUser(response.user);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

