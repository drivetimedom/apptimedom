import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import { Loader2 } from 'lucide-react';
import { getCustomization } from '@/lib/customization';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const customization = getCustomization();

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
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
