import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  Session, 
  getSession, 
  setSession, 
  clearSession, 
  getFromStorage, 
  STORAGE_KEYS 
} from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isInstructor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSessionState] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const existingSession = getSession();
    if (existingSession) {
      const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
      const foundUser = users.find(u => u.id === existingSession.userId);
      if (foundUser && foundUser.active) {
        setUser(foundUser);
        setSessionState(existingSession);
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      return { success: false, error: 'Email ou senha incorretos' };
    }

    if (!foundUser.active) {
      return { success: false, error: 'Conta desativada. Entre em contato com o suporte.' };
    }

    const newSession: Session = {
      userId: foundUser.id,
      email: foundUser.email,
      type: foundUser.type,
      loginAt: new Date().toISOString(),
    };

    setSession(newSession);
    setSessionState(newSession);
    setUser(foundUser);

    return { success: true };
  };

  const logout = () => {
    clearSession();
    setSessionState(null);
    setUser(null);
  };

  const isAdmin = user?.type === 'admin';
  const isInstructor = user?.type === 'instructor' || user?.type === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      login, 
      logout, 
      isAdmin, 
      isInstructor 
    }}>
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
