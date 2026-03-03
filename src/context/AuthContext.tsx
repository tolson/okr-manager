import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Organization } from '../types';
import {
  loadUsers,
  saveUsers,
  loadOrganizations,
  saveOrganizations,
  loadSession,
  saveSession,
  clearSession,
  generateId,
  hashPassword,
} from '../utils/storage';

interface AuthContextType {
  currentUser: User | null;
  currentOrganization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  register: (name: string, email: string, password: string, organizationName: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      const users = loadUsers();
      const organizations = loadOrganizations();
      const user = users.find(u => u.id === session.userId);
      const org = organizations.find(o => o.id === session.organizationId);
      if (user && org) {
        setCurrentUser(user);
        setCurrentOrganization(org);
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const users = loadUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Invalid password' };
    }

    const organizations = loadOrganizations();
    const org = organizations.find(o => o.id === user.organizationId);

    if (!org) {
      return { success: false, error: 'Organization not found' };
    }

    setCurrentUser(user);
    setCurrentOrganization(org);
    saveSession({ userId: user.id, organizationId: org.id });

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentOrganization(null);
    clearSession();
  };

  const register = (
    name: string,
    email: string,
    password: string,
    organizationName: string
  ): { success: boolean; error?: string } => {
    const users = loadUsers();

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email already registered' };
    }

    const organizations = loadOrganizations();

    const newOrg: Organization = {
      id: generateId(),
      name: organizationName,
    };

    const newUser: User = {
      id: generateId(),
      email,
      name,
      organizationId: newOrg.id,
      role: 'admin',
      passwordHash: hashPassword(password),
    };

    saveOrganizations([...organizations, newOrg]);
    saveUsers([...users, newUser]);

    setCurrentUser(newUser);
    setCurrentOrganization(newOrg);
    saveSession({ userId: newUser.id, organizationId: newOrg.id });

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentOrganization,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
        register,
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
