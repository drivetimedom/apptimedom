import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useCustomizationSettings } from '@/hooks/useCustomizationSettings';
import { defaultCustomization } from '@/lib/customization';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  const navigate = useNavigate();
  const { data: customizationData } = useCustomizationSettings();
  const customization = customizationData?.settings || defaultCustomization;

  useEffect(() => {
    const handleRecovery = async () => {
      // Check for recovery event from the URL hash
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event) => {
          if (event === 'PASSWORD_RECOVERY') {
            setIsValidSession(true);
            setChecking(false);
          }
        }
      );

      // Also check if there's already an active session (user clicked the link)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      }
      setChecking(false);

      return () => subscription.unsubscribe();
    };

    handleRecovery();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // Check complexity
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setError('A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        if (updateError.message.includes('been pwned') || updateError.message.includes('leaked')) {
          setError('Esta senha foi encontrada em vazamentos de dados. Por favor, escolha outra.');
        } else {
          setError(updateError.message);
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="text-center mb-8">
            {customization.branding.logoUrl ? (
              <img src={customization.branding.logoUrl} alt="Logo" className="h-12 mx-auto mb-6 object-contain" />
            ) : (
              <h1 className="text-2xl font-bold text-foreground mb-2">{customization.texts.siteTitle}</h1>
            )}
          </div>
          <h2 className="text-lg font-semibold text-foreground">Link inválido ou expirado</h2>
          <p className="text-muted-foreground text-sm">
            O link de redefinição de senha é inválido ou já expirou. Solicite um novo link na tela de login.
          </p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md text-center space-y-4 animate-fade-in">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Senha redefinida com sucesso!</h2>
          <p className="text-muted-foreground text-sm">
            Você será redirecionado automaticamente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          {customization.branding.logoUrl ? (
            <img src={customization.branding.logoUrl} alt="Logo" className="h-12 mx-auto mb-6 object-contain" />
          ) : (
            <h1 className="text-2xl font-bold text-foreground mb-2">{customization.texts.siteTitle}</h1>
          )}
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-2">Redefinir Senha</h2>
        <p className="text-muted-foreground text-sm mb-6">Digite sua nova senha abaixo.</p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm mb-6 animate-scale-in">
            {error}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 bg-card border-border focus:border-primary h-12"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mín. 8 caracteres com maiúsculas, minúsculas, números e caracteres especiais.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-card border-border focus:border-primary h-12"
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redefinindo...
              </>
            ) : (
              'Redefinir Senha'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
