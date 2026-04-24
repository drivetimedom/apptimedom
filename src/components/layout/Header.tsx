import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMemberGlobalSettings } from '@/hooks/useTeamMembers';
import { useAiTools } from '@/hooks/useAiTools';
import { Button } from '@/components/ui/button';
import GlobalSearch from '@/components/layout/GlobalSearch';
import ProResourceModal from '@/components/student/ProResourceModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LogOut, 
  User, 
  LayoutDashboard,
  BookOpen,
  FileText,
  Menu,
  X,
  DollarSign,
  Sparkles,
  Wrench,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import NotificationDropdown from '@/components/layout/NotificationDropdown';
import { Customization, defaultCustomization } from '@/lib/customization';
import fallbackLogo from '@/assets/LOGO_TIME_DOM.png';

interface HeaderProps {
  customization?: Customization;
}

const Header: React.FC<HeaderProps> = ({ customization = defaultCustomization }) => {
  const { user, profile, logout, isAdmin, isInstructor, isTeamMember, isStudent } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [proModalResource, setProModalResource] = useState<string | null>(null);
  
  const { data: tmSettings } = useTeamMemberGlobalSettings();
  const { data: aiTools = [] } = useAiTools();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allNavLinks = [
    { href: '/', label: 'Início', icon: LayoutDashboard, alwaysShow: true },
    { href: '/my-courses', label: 'Meus Cursos', icon: BookOpen, alwaysShow: true },
    { href: '/hoff-circle', label: 'HOF CIRCLE', icon: BookOpen, tmKey: 'hof_circle_access' as const, hideForStudent: true },
    { href: '/financial-system', label: 'Calculadoras', icon: DollarSign, tmKey: 'calculators_access' as const, proForStudent: true },
    { href: '/swipe-file', label: 'Swipe File', icon: FileText, tmKey: 'swipefile_access' as const, proForStudent: true },
  ];

  // Filter links for team_member and student
  const navLinks = allNavLinks.filter(link => {
    if (link.alwaysShow) return true;
    // Hide HOF Circle completely for students
    if (isStudent && link.hideForStudent) return false;
    if (!isTeamMember) return true;
    if (!link.tmKey) return true;
    return tmSettings?.[link.tmKey] === true;
  });

  const isActiveLink = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Use DB logo, fallback to embedded asset
  const logoSrc = customization.branding.logoUrl || fallbackLogo;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src={logoSrc} 
            alt={customization.texts.siteTitle || 'Logo'} 
            className="h-10 md:h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isProLocked = isStudent && link.proForStudent;
            
            if (isProLocked) {
              return (
                <button
                  key={link.href}
                  onClick={() => setProModalResource(link.label)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/50 flex items-center gap-1.5"
                >
                  {link.label}
                  <span className="flex items-center gap-0.5 text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                    <Sparkles className="w-2.5 h-2.5" />
                    PRO
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActiveLink(link.href)
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Ferramentas Dropdown - disponível para todos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 outline-none ${
                  isActiveLink('/ferramentas')
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                Ferramentas
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 bg-popover border-border">
              <DropdownMenuItem
                className="cursor-pointer focus:bg-accent flex-col items-start gap-1 py-3"
                onClick={() => navigate('/ferramentas')}
              >
                <div className="flex items-center gap-2 w-full">
                  <Wrench className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">Ver todas as ferramentas</span>
                </div>
                <span className="text-xs text-muted-foreground pl-6">Recursos de IA da plataforma</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              {aiTools.length === 0 ? (
                <div className="px-2 py-2 text-xs text-muted-foreground">Nenhuma ferramenta disponível</div>
              ) : (
                aiTools.map((tool) => (
                  <DropdownMenuItem
                    key={tool.id}
                    className="cursor-pointer focus:bg-accent flex-col items-start gap-1 py-3"
                    onClick={() => window.open(tool.link, '_blank', 'noopener,noreferrer')}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium text-foreground flex-1">{tool.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground">{tool.description}</span>
                  </DropdownMenuItem>
                ))
              )}
          </DropdownMenuContent>
          </DropdownMenu>

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActiveLink('/admin')
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Admin
            </Link>
          )}
          {isInstructor && !isAdmin && (
            <Link
              to="/instructor"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActiveLink('/instructor')
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              Meus Conteúdos
            </Link>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <GlobalSearch className="hidden lg:flex w-64" />

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={profile?.avatar || undefined} alt={profile?.name} />
                  <AvatarFallback className="bg-accent text-foreground">
                    {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-sm text-foreground">{profile?.name || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="cursor-pointer focus:bg-accent" onClick={() => navigate('/perfil')}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              {isInstructor && (
                <>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem 
                    className="cursor-pointer focus:bg-accent"
                    onClick={() => navigate(isAdmin ? '/admin' : '/instructor')}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{isAdmin ? 'Painel Admin' : 'Meus Conteúdos'}</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-up">
          <div className="container py-4 space-y-2">
            {/* Mobile Search */}
            <div className="mb-4">
              <GlobalSearch className="w-full" />
            </div>
            
            {navLinks.map((link) => {
              const isProLocked = isStudent && link.proForStudent;
              
              if (isProLocked) {
                return (
                  <button
                    key={link.href}
                    onClick={() => {
                      setProModalResource(link.label);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-muted-foreground hover:bg-accent/50 w-full text-left"
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="flex-1">{link.label}</span>
                    <span className="flex items-center gap-0.5 text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      <Sparkles className="w-2.5 h-2.5" />
                      PRO
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActiveLink(link.href)
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent/50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link
              to="/ferramentas"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActiveLink('/ferramentas')
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span>Ferramentas</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActiveLink('/admin')
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent/50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Painel Admin</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* PRO Resource Modal */}
      <ProResourceModal
        open={!!proModalResource}
        onClose={() => setProModalResource(null)}
        resourceName={proModalResource || ''}
      />
    </header>
  );
};

export default Header;
