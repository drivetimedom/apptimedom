import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMyTeamMembers, useToggleTeamMemberStatus } from '@/hooks/useTeamMembers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Ban, CheckCircle, Loader2 } from 'lucide-react';

const MyTeamSection: React.FC = () => {
  const { user } = useAuth();
  const { data: teamMembers = [], isLoading } = useMyTeamMembers(user?.id);
  const toggleStatus = useToggleTeamMemberStatus();

  const activeCount = teamMembers.filter(m => m.status === 'active').length;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  // Don't show if no team members
  if (teamMembers.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Minha Equipe Comercial</h3>
            <p className="text-xs text-muted-foreground">Acessos: {activeCount}/5</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {teamMembers.map(member => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{member.member_name}</p>
              <p className="text-xs text-muted-foreground">{member.member_email}</p>
              <Badge variant={member.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                {member.status === 'active' ? '✅ Ativo' : '❌ Suspenso'}
              </Badge>
            </div>
            <div>
              {member.status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (user && confirm(`Suspender acesso de ${member.member_name}?`)) {
                      toggleStatus.mutate({ teamMemberId: member.id, newStatus: 'suspended', userId: user.id });
                    }
                  }}
                  disabled={toggleStatus.isPending}
                  className="gap-1 text-xs"
                >
                  <Ban className="w-3 h-3" /> Suspender
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (user) toggleStatus.mutate({ teamMemberId: member.id, newStatus: 'active', userId: user.id });
                  }}
                  disabled={toggleStatus.isPending}
                  className="gap-1 text-xs"
                >
                  <CheckCircle className="w-3 h-3" /> Reativar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-accent/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 Precisa adicionar alguém? Entre em contato com o suporte.
        </p>
      </div>
    </Card>
  );
};

export default MyTeamSection;
