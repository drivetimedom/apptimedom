import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  instagram: string | null;
  status: 'iniciante' | 'primeiras-vendas' | 'intermediario' | 'avancado' | 'elite';
  prescribed_map: string | null;
  visible_challenges: string[];
  activation_plan: any[];
  unlocked_courses: string[];
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'instructor' | 'user';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isInstructor: boolean;
  role: UserRole | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      return profileData as Profile | null;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const fetchRole = async (userId: string): Promise<UserRole | null> => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role')
        .limit(1)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return 'user';
      }

      return (roleData?.role as UserRole) || 'user';
    } catch (error) {
      console.error('Error in fetchRole:', error);
      return 'user';
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const newProfile = await fetchProfile(user.id);
      setProfile(newProfile);
    }
  };

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(async () => {
            const [userProfile, userRole] = await Promise.all([
              fetchProfile(currentSession.user.id),
              fetchRole(currentSession.user.id)
            ]);
            setProfile(userProfile);
            setRole(userRole);
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!initialSession) {
        setIsLoading(false);
      }
      // The onAuthStateChange will handle setting the session
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Real-time subscription for profile changes (prescription sync)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update profile in real-time when admin changes prescriptions
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email ou senha incorretos' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Email não confirmado. Verifique sua caixa de entrada.' };
        }
        if (error.message.includes('password') && (error.message.includes('leaked') || error.message.includes('pwned') || error.message.includes('breached'))) {
          return { success: false, error: 'Sua senha foi encontrada em vazamentos de dados. Por favor, redefina sua senha.' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Este email já está cadastrado' };
        }
        if (error.message.includes('password') && error.message.includes('leaked') || error.message.includes('pwned') || error.message.includes('breached')) {
          return { success: false, error: 'Esta senha foi encontrada em vazamentos de dados conhecidos. Por favor, escolha uma senha mais segura.' };
        }
        if (error.message.includes('Password should be at least')) {
          return { success: false, error: 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Erro ao criar conta' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const isAdmin = role === 'admin';
  const isInstructor = role === 'instructor' || role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      session, 
      isLoading, 
      login,
      signup,
      logout, 
      isAdmin, 
      isInstructor,
      role,
      refreshProfile,
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
