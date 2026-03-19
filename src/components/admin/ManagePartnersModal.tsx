import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePartnerDetails, useAddPartnership, useRemovePartnership } from '@/hooks/usePartnerships';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Trash2, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ManagePartnersModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ManagePartnersModal: React.FC<ManagePartnersModalProps> = ({ userId, userName, isOpen, onClose }) => {
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const { data: partners = [], isLoading: partnersLoading } = usePartnerDetails(userId);
  const addPartnership = useAddPartnership();
  const removePartnership = useRemovePartnership();

  // Available users (role = 'user', not already a partner)
  const { data: availableUsers = [] } = useQuery({
    queryKey: ['available-partners', userId, partners],
    queryFn: async () => {
      const partnerUserIds = partners.map((p: any) => p.user_id);
      const excludeIds = [userId, ...partnerUserIds];

      // Get user_ids with role 'user'
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'user');

      if (!userRoles) return [];

      const userIds = userRoles
        .map(r => r.user_id)
        .filter(id => !excludeIds.includes(id));

      if (userIds.length === 0) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', userIds)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: showAddPartner,
  });

  const handleAdd = () => {
    if (!selectedUserId) return;
    addPartnership.mutate(
      { primaryUserId: userId, partnerUserId: selectedUserId },
      {
        onSuccess: () => {
          toast.success('Sócio adicionado com sucesso!');
          setShowAddPartner(false);
          setSelectedUserId('');
        },
        onError: (err: any) => {
          toast.error(err.message || 'Erro ao adicionar sócio');
        },
      }
    );
  };

  const handleRemove = (partnerId: string, partnerName: string) => {
    if (!confirm(`Remover ${partnerName} como sócio?`)) return;
    removePartnership.mutate(
      { userId, partnerId },
      {
        onSuccess: () => toast.success('Sócio removido'),
        onError: () => toast.error('Erro ao remover sócio'),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Gerenciar Sócios
          </DialogTitle>
          <DialogDescription>{userName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Sócios compartilham automaticamente: dados de tráfego, comercial, prescrições, aulas extras e reuniões.
            </p>
          </div>

          {/* Add partner */}
          {!showAddPartner ? (
            <Button onClick={() => setShowAddPartner(true)} variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Sócio
            </Button>
          ) : (
            <div className="space-y-3 p-3 border border-border rounded-lg">
              <p className="text-sm font-medium text-foreground">Selecione o médico:</p>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um médico" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user: any) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowAddPartner(false); setSelectedUserId(''); }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!selectedUserId || addPartnership.isPending}
                  className="flex-1"
                >
                  {addPartnership.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
                </Button>
              </div>
            </div>
          )}

          {/* Partners list */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Sócios Atuais ({partners.length})
            </p>

            {partnersLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : partners.length > 0 ? (
              <div className="space-y-2">
                {partners.map((partner: any) => (
                  <div key={partner.user_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{partner.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{partner.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive shrink-0"
                      onClick={() => handleRemove(partner.user_id, partner.name)}
                      disabled={removePartnership.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum sócio vinculado
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagePartnersModal;
