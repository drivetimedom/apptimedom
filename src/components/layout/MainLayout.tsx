import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApplyCustomization } from '@/hooks/useApplyCustomization';

const MainLayout: React.FC = () => {
  const { user, profile, isLoading, logout, isAdmin } = useAuth();
  const customization = useApplyCustomization();

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
