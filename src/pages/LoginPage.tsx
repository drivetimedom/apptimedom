import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useCustomizationSettings } from '@/hooks/useCustomizationSettings';
import { defaultCustomization } from '@/lib/customization';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();
  const { data: customizationData } = useCustomizationSettings();
  const customization = customizationData?.settings || defaultCustomization;

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Erro ao fazer login');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await signup(email, password, name);
    setIsLoading(false);
    
    if (result.success) {
      setSuccess('Conta criada! Verifique seu email para confirmar.');
      setActiveTab('login');
      setEmail('');
      setPassword('');
      setName('');
    } else {
      setError(result.error || 'Erro ao criar conta');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {customization.branding.loginBackgroundUrl ? (
          <img 
            src={customization.branding.loginBackgroundUrl} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
        )}
        
        {/* Copyright at bottom of image */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm text-white/70">
            {customization.texts.footerText}
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8">
            {customization.branding.logoLoginUrl ? (
              <img 
                src={customization.branding.logoLoginUrl} 
                alt="Logo" 
                className="h-12 mx-auto mb-6 object-contain"
              />
            ) : customization.branding.logoUrl ? (
              <img 
                src={customization.branding.logoUrl} 
                alt="Logo" 
                className="h-12 mx-auto mb-6 object-contain"
              />
            ) : (
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {customization.texts.siteTitle}
              </h1>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent border-b border-border rounded-none h-auto p-0">
              <TabsTrigger 
                value="login" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary pb-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                Acessar sua conta
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary pb-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                Crie sua conta
              </TabsTrigger>
            </TabsList>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm mb-6 animate-scale-in">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-success/10 border border-success/20 text-success rounded-lg p-3 text-sm mb-6 animate-scale-in">
                {success}
              </div>
            )}

            {/* Login Tab */}
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground">E-mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-card border-border focus:border-primary transition-colors h-12"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 bg-card border-border focus:border-primary transition-colors h-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Lembrar de mim
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>

                {/* Forgot Password */}
                <div className="text-center">
                  <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors underline">
                    Esqueceu sua senha?
                  </button>
                </div>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSignup} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-foreground">Nome</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-card border-border focus:border-primary transition-colors h-12"
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground">E-mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-card border-border focus:border-primary transition-colors h-12"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground">Senha</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 bg-card border-border focus:border-primary transition-colors h-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Mobile Footer */}
          <div className="lg:hidden mt-12 text-center">
            <p className="text-xs text-muted-foreground">
              {customization.texts.footerText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
