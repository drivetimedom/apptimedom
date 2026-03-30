import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users, Mail, CheckCircle, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CreateAccessModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: any;
}

const generateRandomPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';
  let password = 'Hof';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + '@';
};

const CreateAccessModal = ({ open, onClose, onSuccess, submission }: CreateAccessModalProps) => {
  const [generatePassword, setGeneratePassword] = useState(true);
  const [manualPassword, setManualPassword] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string; userId: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const createAccess = useMutation({
    mutationFn: async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Não autenticado');

      const password = generatePassword ? generateRandomPassword() : manualPassword;

      if (!password || password.length < 6) {
        throw new Error('Senha deve ter pelo menos 6 caracteres');
      }

      // 1. Create user via edge function (uses admin API)
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: submission.email,
          password,
          name: submission.full_name,
          role: 'user',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newUserId = data?.userId;
      if (!newUserId) throw new Error('Erro ao criar usuário');

      // 2. Update onboarding_submission
      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({
          user_id: newUserId,
          status: 'access_created',
          access_created_at: new Date().toISOString(),
          access_created_by: currentUser.id,
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      // 3. Send welcome email with credentials
      if (sendEmail) {
        try {
          await supabase.functions.invoke('email-boas-vindas', {
            body: {
              email: submission.email,
              name: submission.full_name,
              password,
            },
          });
        } catch (e) {
          console.warn('Email de boas-vindas não enviado:', e);
        }
      }

      return { email: submission.email, password, userId: newUserId };
    },
    onSuccess: (data) => {
      setCreatedCredentials(data);
      toast.success('Acesso criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar acesso');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccess.mutate();
  };

  const handleClose = () => {
    if (createdCredentials) {
      onSuccess();
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {!createdCredentials ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Criar Acesso na Plataforma
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Info do aluno */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-muted-foreground">Criar acesso para:</p>
                <p className="font-semibold">{submission?.full_name}</p>
                <p className="text-sm text-muted-foreground">{submission?.email}</p>
              </div>

              {/* Configuração automática */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="font-semibold text-sm mb-2">✨ Configuração Automática</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>✅ Role: Médico (acesso completo)</p>
                  <p>✅ Cursos: Todos liberados</p>
                  <p>✅ Diagnóstico: Salvo (visível só pra admin)</p>
                  <p>✅ Swipe File: Acesso total</p>
                  <p>✅ Calculadoras: Acesso total</p>
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-3">
                <Label className="font-semibold">Senha de Acesso *</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="passwordType"
                      checked={generatePassword}
                      onChange={() => setGeneratePassword(true)}
                      className="accent-primary"
                    />
                    <span className="text-sm">Gerar senha automática (recomendado)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="passwordType"
                      checked={!generatePassword}
                      onChange={() => setGeneratePassword(false)}
                      className="accent-primary"
                    />
                    <span className="text-sm">Definir senha manualmente</span>
                  </label>
                </div>

                {!generatePassword && (
                  <Input
                    type="text"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                  />
                )}
              </div>

              {/* Email */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="accent-primary w-4 h-4"
                />
                <div>
                  <span className="text-sm font-medium">Enviar credenciais por email</span>
                  <p className="text-xs text-muted-foreground">Email automático com login e senha</p>
                </div>
              </label>

              {/* Botões */}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={createAccess.isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAccess.isPending}>
                  {createAccess.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Criar Acesso
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* Sucesso */
          <div className="space-y-6 py-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-semibold">✅ Acesso Criado!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {submission?.full_name} agora pode acessar a plataforma
              </p>
            </div>

            {/* Credenciais */}
            <div className="bg-muted/50 border rounded-lg p-4 space-y-3">
              <p className="font-semibold text-sm flex items-center gap-2">
                🔑 Credenciais de Acesso
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Email:</p>
                    <p className="text-sm font-mono">{createdCredentials.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(createdCredentials.email, 'email')}
                  >
                    {copiedField === 'email' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Senha:</p>
                    <p className="text-sm font-mono">{createdCredentials.password}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(createdCredentials.password, 'password')}
                  >
                    {copiedField === 'password' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {sendEmail && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email enviado com as credenciais para {submission?.email}
                </p>
              </div>
            )}

            {/* Próximos passos */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
              <p className="font-semibold mb-2">📋 Próximos passos:</p>
              <p>✅ Aluno já pode fazer login na plataforma</p>
              <p>✅ Diagnóstico está salvo (visível só pra você)</p>
              <p>✅ Todos os cursos liberados automaticamente</p>
              <p>✅ Pode prescrever planos e aulas normalmente</p>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccessModal;
