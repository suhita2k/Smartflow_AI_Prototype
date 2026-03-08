import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '../types';
import { USERS, CREDENTIALS, ROLE_PERMISSIONS } from '../data/mockData';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  phone: string;
  bio: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  credentials: Record<string, string>;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: RegisterData) => { success: boolean; message: string };
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  changeUserStatus: (id: string, status: User['status']) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS);
  const [credentials, setCredentials] = useState<Record<string, string>>(CREDENTIALS);

  const login = (email: string, password: string): boolean => {
    const correctPassword = credentials[email];
    if (correctPassword && correctPassword === password) {
      const found = users.find(u => u.email === email);
      if (found) {
        if (found.status === 'suspended') return false;
        if (found.status === 'inactive') return false;
        // Update last login
        setUsers(prev => prev.map(u => u.id === found.id ? { ...u, lastLogin: 'Just now' } : u));
        setUser({ ...found, lastLogin: 'Just now' });
        return true;
      }
    }
    return false;
  };

  const logout = () => setUser(null);

  const register = (data: RegisterData): { success: boolean; message: string } => {
    // Check duplicate email
    if (users.find(u => u.email === data.email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    if (credentials[data.email]) {
      return { success: false, message: 'This email is already registered.' };
    }

    const initials = data.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: initials,
      status: 'pending',
      department: data.department,
      phone: data.phone,
      bio: data.bio,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      permissions: ROLE_PERMISSIONS[data.role] || [],
    };

    setUsers(prev => [...prev, newUser]);
    setCredentials(prev => ({ ...prev, [data.email]: data.password }));

    return { success: true, message: 'Account created successfully! Awaiting admin approval.' };
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    if (user?.id === id) {
      setUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const changeUserStatus = (id: string, status: User['status']) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, users, credentials, login, logout, register, updateUser, deleteUser, changeUserStatus, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
