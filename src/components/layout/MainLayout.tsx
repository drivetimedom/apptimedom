import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsTeamMemberSuspended, useTeamMemberGlobalSettings } from '@/hooks/useTeamMembers';
import Header from './Header';
import { Loader2, ShieldX, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApplyCustomization } from '@/hooks/useApplyCustomization';

const MainLayout: React.FC = () => {
  const { user, profile, isLoading, logout, isAdmin, isTeamMember, isStudent } = useAuth();
  const customization = useApplyCustomization();
  const location = useLocation();
  const { data: isSuspended } = useIsTeamMemberSuspended();
  const { data: tmSettings } = useTeamMemberGlobalSettings();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Show blocked screen for non-admin blocked users
  if (profile?.blocked && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldX className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Acesso Bloqueado</h1>
          <p className="text-muted-foreground">
            Seu acesso à plataforma foi temporariamente suspenso. Entre em contato com o administrador para mais informações.
          </p>
          <Button variant="outline" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    );
  }

  // Show suspended screen for suspended team members
  if (isTeamMember && isSuspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Ban className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Acesso Suspenso</h1>
          <p className="text-muted-foreground">
            Seu acesso foi suspenso pelo médico responsável. Entre em contato para mais informações.
          </p>
          <Button variant="outline" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    );
  }

  // Block student from restricted routes
  if (isStudent) {
    const studentBlockedRoutes = ['/hoff-circle', '/financial-system', '/swipe-file', '/diagnostico', '/admin'];
    const isBlocked = studentBlockedRoutes.some(r => location.pathname.startsWith(r));
    if (isBlocked) {
      return <Navigate to="/" replace />;
    }
  }

  // Block team_member from restricted routes
  if (isTeamMember && tmSettings) {
    const restrictedRoutes: { path: string; setting: keyof typeof tmSettings }[] = [
      { path: '/hoff-circle', setting: 'hof_circle_access' },
      { path: '/financial-system', setting: 'calculators_access' },
      { path: '/swipe-file', setting: 'swipefile_access' },
      { path: '/diagnostico', setting: 'hof_circle_access' },
    ];
    
    const blocked = restrictedRoutes.find(
      r => location.pathname.startsWith(r.path) && !tmSettings[r.setting]
    );

    if (blocked || location.pathname.startsWith('/admin')) {
      return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header customization={customization} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {customization.texts.footerText}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
