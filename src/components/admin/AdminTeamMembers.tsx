import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAdminTeamMembers, useToggleTeamMemberStatus, useDeleteTeamMember, useTeamMemberCount, useTeamMemberGlobalSettings, useUpdateTeamMemberGlobalSettings, TeamMember } from '@/hooks/useTeamMembers';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useCourses } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Plus, Search, Loader2, Ban, CheckCircle, Trash2, Settings, UserPlus, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AdminTeamMembers: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const { data: teamMembers = [], isLoading: loadingTeams } = useAdminTeamMembers();
  const { data: adminUsers = [] } = useAdminUsers();
  const toggleStatus = useToggleTeamMemberStatus();
  const deleteMember = useDeleteTeamMember();

  // Filter
  const filteredMembers = teamMembers.filter(tm =>
    tm.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tm.member_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tm.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by owner
  const groupedByOwner = filteredMembers.reduce((acc, tm) => {
    const key = tm.owner_id;
    if (!acc[key]) {
      acc[key] = { owner_name: tm.owner_name || '', owner_email: tm.owner_email || '', members: [] };
    }
    acc[key].members.push(tm);
    return acc;
  }, {} as Record<string, { owner_name: string; owner_email: string; members: TeamMember[] }>);

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="list" className="gap-2">
              <Users className="w-4 h-4" />
              Equipes
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Novo Team Member
          </Button>
        </div>

        {/* LIST TAB */}
        <TabsContent value="list" className="space-y-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="pl-10 bg-input border-border"
            />
          </div>

          {loadingTeams ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : Object.keys(groupedByOwner).length > 0 ? (
            Object.entries(groupedByOwner).map(([ownerId, group]) => (
              <Card key={ownerId} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">📁 {group.owner_name}</h3>
                    <p className="text-sm text-muted-foreground">{group.owner_email} • {group.members.length}/5 acessos</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {group.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{member.member_name}</p>
                        <p className="text-sm text-muted-foreground">{member.member_email}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                            {member.status === 'active' ? '✅ Ativo' : '❌ Suspenso'}
                          </Badge>
                          {member.status === 'suspended' && member.suspended_at && (
                            <span className="text-xs text-muted-foreground">
                              Suspenso em {new Date(member.suspended_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => user && toggleStatus.mutate({ teamMemberId: member.id, newStatus: 'suspended', userId: user.id })}
                            disabled={toggleStatus.isPending}
                            className="gap-1"
                          >
                            <Ban className="w-3 h-3" /> Suspender
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => user && toggleStatus.mutate({ teamMemberId: member.id, newStatus: 'active', userId: user.id })}
                            disabled={toggleStatus.isPending}
                            className="gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Reativar
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteConfirm({ id: member.id, name: member.member_name || '' })}
                          className="gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma equipe cadastrada ainda</p>
            </Card>
          )}
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings">
          <TeamMemberSettingsPanel />
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      {createModalOpen && (
        <CreateTeamMemberModal
          onClose={() => setCreateModalOpen(false)}
          adminUsers={adminUsers}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir membro permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso removerá o vínculo de <strong>{deleteConfirm?.name}</strong> com o médico. O usuário auth continuará existindo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteConfirm) { deleteMember.mutate(deleteConfirm.id); setDeleteConfirm(null); } }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// === CREATE MODAL ===
const CreateTeamMemberModal: React.FC<{ onClose: () => void; adminUsers: any[] }> = ({ onClose, adminUsers }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [ownerSearch, setOwnerSearch] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<{ user_id: string; name: string; email: string | null } | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Filter doctors (role=user, not team_member)
  const doctors = adminUsers.filter(u =>
    u.role === 'user' &&
    (ownerSearch.length < 2 || u.name.toLowerCase().includes(ownerSearch.toLowerCase()) || (u.email || '').toLowerCase().includes(ownerSearch.toLowerCase()))
  ).slice(0, 10);

  const { data: teamCount } = useTeamMemberCount(selectedOwner?.user_id);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$';
    let pwd = 'Hof';
    for (let i = 0; i < 8; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    pwd += '@';
    setGeneratedPassword(pwd);
    setFormData(prev => ({ ...prev, password: pwd }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !selectedOwner) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }
    if (teamCount !== undefined && teamCount >= 5) {
      toast({ title: 'Limite de 5 membros atingido', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-team-member', {
        body: {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          ownerId: selectedOwner.user_id,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast({ title: `✅ Team member criado! Credenciais: ${formData.email} / ${formData.password}` });
      onClose();
    } catch (err: any) {
      toast({ title: 'Erro ao criar team member', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Novo Team Member
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={handleSubmit} className="space-y-5 pb-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Nome completo *</Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Maria Silva" className="bg-input border-border" required />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="maria@clinica.com.br" className="bg-input border-border" required />
            </div>

            {/* Owner Search */}
            <div className="space-y-2">
              <Label>Vincular ao médico *</Label>
              {selectedOwner ? (
                <Card className="p-3 bg-accent/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{selectedOwner.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedOwner.email}</p>
                      {typeof teamCount === 'number' && (
                        <p className={`text-xs mt-1 ${teamCount >= 5 ? 'text-destructive' : 'text-green-500'}`}>
                          Acessos: {teamCount}/5 {teamCount >= 5 ? '❌ Limite atingido' : '✅'}
                        </p>
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedOwner(null)}>✕</Button>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={ownerSearch} onChange={e => setOwnerSearch(e.target.value)} placeholder="Buscar médico..." className="pl-10 bg-input border-border" />
                  </div>
                  {ownerSearch.length >= 2 && (
                    <div className="border border-border rounded-lg max-h-40 overflow-y-auto">
                      {doctors.length > 0 ? doctors.map(d => (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => { setSelectedOwner({ user_id: d.user_id, name: d.name, email: d.email }); setOwnerSearch(''); }}
                          className="w-full p-3 text-left hover:bg-accent/50 transition-colors border-b border-border last:border-0"
                        >
                          <p className="text-sm font-medium text-foreground">{d.name}</p>
                          <p className="text-xs text-muted-foreground">{d.email}</p>
                        </button>
                      )) : (
                        <p className="p-3 text-sm text-muted-foreground">Nenhum médico encontrado</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Senha *</Label>
              <div className="flex gap-2">
                <Input value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} placeholder="Mínimo 6 caracteres" className="bg-input border-border" required />
                <Button type="button" variant="outline" size="sm" onClick={generatePassword} className="whitespace-nowrap">
                  Gerar
                </Button>
              </div>
              {generatedPassword && (
                <p className="text-xs text-muted-foreground bg-accent/30 p-2 rounded font-mono">
                  Senha gerada: {generatedPassword}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="bg-accent/20 border border-accent/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                ℹ️ Salve as credenciais antes de criar. O team member terá acesso limitado conforme as configurações globais.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
              <Button type="submit" disabled={isSubmitting || (teamCount !== undefined && teamCount >= 5)} className="flex-1">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Acesso
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// === SETTINGS PANEL ===
const TeamMemberSettingsPanel: React.FC = () => {
  const { data: settings, isLoading } = useTeamMemberGlobalSettings();
  const { data: courses = [] } = useCourses();
  const updateSettings = useUpdateTeamMemberGlobalSettings();

  const [localSettings, setLocalSettings] = useState<{
    allowed_course_ids: string[];
    swipefile_access: boolean;
    calculators_access: boolean;
    hof_circle_access: boolean;
  }>({
    allowed_course_ids: [],
    swipefile_access: true,
    calculators_access: false,
    hof_circle_access: false,
  });

  // Sync from server
  React.useEffect(() => {
    if (settings) {
      setLocalSettings({
        allowed_course_ids: settings.allowed_course_ids || [],
        swipefile_access: settings.swipefile_access,
        calculators_access: settings.calculators_access,
        hof_circle_access: settings.hof_circle_access,
      });
    }
  }, [settings]);

  const toggleCourse = (courseId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      allowed_course_ids: prev.allowed_course_ids.includes(courseId)
        ? prev.allowed_course_ids.filter(id => id !== courseId)
        : [...prev.allowed_course_ids, courseId],
    }));
  };

  const handleSave = () => {
    if (!settings) return;
    updateSettings.mutate({
      id: settings.id,
      ...localSettings,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Recursos Liberados</h3>
        <p className="text-sm text-muted-foreground">Configure quais recursos TODOS os team members terão acesso.</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Swipe File</Label>
            <Switch checked={localSettings.swipefile_access} onCheckedChange={v => setLocalSettings(p => ({ ...p, swipefile_access: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Calculadoras Financeiras</Label>
            <Switch checked={localSettings.calculators_access} onCheckedChange={v => setLocalSettings(p => ({ ...p, calculators_access: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>HOF Circle (Acompanhamento)</Label>
            <Switch checked={localSettings.hof_circle_access} onCheckedChange={v => setLocalSettings(p => ({ ...p, hof_circle_access: v }))} />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Cursos Liberados</h3>
        <p className="text-sm text-muted-foreground">
          Selecione os cursos que team members poderão acessar ({localSettings.allowed_course_ids.length} selecionados).
        </p>

        <ScrollArea className="h-80">
          <div className="space-y-2">
            {courses.map(course => (
              <label key={course.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  checked={localSettings.allowed_course_ids.includes(course.id)}
                  onCheckedChange={() => toggleCourse(course.id)}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{course.title}</p>
                  {course.subtitle && <p className="text-xs text-muted-foreground">{course.subtitle}</p>}
                </div>
              </label>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Button onClick={handleSave} disabled={updateSettings.isPending} className="w-full">
        {updateSettings.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Salvar Configurações
      </Button>
    </div>
  );
};

export default AdminTeamMembers;
