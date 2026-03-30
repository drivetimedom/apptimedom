import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CreateAccessModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: any;
}

const CreateAccessModal = ({ open, onClose, onSuccess, submission }: CreateAccessModalProps) => {
  const createAccess = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Create user via edge function
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: submission.email,
          name: submission.full_name,
          role: 'user',
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newUserId = data?.user?.id;
      if (!newUserId) throw new Error('Erro ao criar usuário');

      // Update submission with user_id and status
      const { error: updateError } = await supabase
        .from('onboarding_submissions')
        .update({
          user_id: newUserId,
          status: 'access_created',
          access_created_at: new Date().toISOString(),
          access_created_by: user.id,
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      // Send welcome email
      try {
        await supabase.functions.invoke('email-boas-vindas', {
          body: {
            email: submission.email,
            name: submission.full_name,
          },
        });
      } catch (e) {
        console.warn('Email de boas-vindas não enviado:', e);
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Acesso criado com sucesso! Email de boas-vindas enviado.');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar acesso');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>👤 Criar Acesso na Plataforma</DialogTitle>
          <DialogDescription>
            Será criada uma conta para <strong>{submission?.full_name}</strong> ({submission?.email}) com role "user" e todos os cursos liberados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
            <p>✅ Conta será criada automaticamente</p>
            <p>✅ Role: Médico (user)</p>
            <p>✅ Email de boas-vindas será enviado</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={() => createAccess.mutate()}
              disabled={createAccess.isPending}
            >
              {createAccess.isPending ? 'Criando...' : 'Criar Acesso'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccessModal;
