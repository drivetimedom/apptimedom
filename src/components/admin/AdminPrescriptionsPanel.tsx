import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Map, Trophy, User, Loader2, Eye, X, Filter, Plus, Check } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { getLucideIcon } from '@/lib/iconMap';
import { useHofMaps } from '@/hooks/useHofMaps';
import { useHofChallenges } from '@/hooks/useHofChallenges';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  user_id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  prescribed_map: string | null;
  visible_challenges: string[] | null;
  status: string | null;
  updated_at: string | null;
}

const AdminPrescriptionsPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterMap, setFilterMap] = useState<string>('all');
  const [filterChallenge, setFilterChallenge] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'remove-map' | 'remove-challenge'; profileId: string; challengeId?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [newPrescSearch, setNewPrescSearch] = useState('');
  const [newPrescUserId, setNewPrescUserId] = useState<string | null>(null);
  const [newPrescMap, setNewPrescMap] = useState<string>('none');
  const [newPrescChallenges, setNewPrescChallenges] = useState<string[]>([]);
  const [savingNew, setSavingNew] = useState(false);

  const { data: maps = [] } = useHofMaps();
  const { data: challenges = [] } = useHofChallenges();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-prescriptions-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email, avatar, prescribed_map, visible_challenges, status, updated_at')
        .order('name');
      if (error) throw error;
      return (data || []) as ProfileData[];
    },
  });

  const prescribedProfiles = useMemo(() => {
    return profiles.filter(p =>
      (p.prescribed_map && p.prescribed_map !== '') ||
      (p.visible_challenges && p.visible_challenges.length > 0)
    );
  }, [profiles]);

  const filtered = useMemo(() => {
    let list = profiles;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
      );
    }

    if (filterMap !== 'all') {
      if (filterMap === 'none') {
        list = list.filter(p => !p.prescribed_map || p.prescribed_map === '');
      } else {
        list = list.filter(p => p.prescribed_map === filterMap);
      }
    }

    if (filterChallenge !== 'all') {
      if (filterChallenge === 'none') {
        list = list.filter(p => !p.visible_challenges || p.visible_challenges.length === 0);
      } else {
        list = list.filter(p => (p.visible_challenges || []).includes(filterChallenge));
      }
    }

    return list;
  }, [profiles, search, filterMap, filterChallenge]);

  const getMapName = (mapId: string) => maps.find(m => m.id === mapId)?.name || mapId;
  const getMapIcon = (mapId: string) => {
    const map = maps.find(m => m.id === mapId);
    if (!map) return null;
    const Icon = getLucideIcon(map.icon);
    return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
  };
  const getChallengeName = (cId: string) => challenges.find(c => c.id === cId)?.name || cId;
  const getChallengeIcon = (cId: string) => {
    const ch = challenges.find(c => c.id === cId);
    if (!ch) return null;
    const Icon = getLucideIcon(ch.icon);
    return Icon ? <Icon className="w-3 h-3" /> : null;
  };

  const uniqueMapsInUse = useMemo(() => {
    const ids = new Set(prescribedProfiles.map(p => p.prescribed_map).filter(Boolean) as string[]);
    return maps.filter(m => ids.has(m.id));
  }, [prescribedProfiles, maps]);

  const uniqueChallengesInUse = useMemo(() => {
    const ids = new Set(prescribedProfiles.flatMap(p => (p.visible_challenges || []) as string[]));
    return challenges.filter(c => ids.has(c.id));
  }, [prescribedProfiles, challenges]);

  const handleConfirmRevoke = async () => {
    if (!confirmAction) return;
    setSaving(true);
    try {
      const profile = profiles.find(p => p.user_id === confirmAction.profileId);
      if (!profile) return;

      if (confirmAction.type === 'remove-map') {
        const { error } = await supabase
          .from('profiles')
          .update({ prescribed_map: null })
          .eq('user_id', confirmAction.profileId);
        if (error) throw error;
        toast({ title: 'Mapa removido com sucesso' });
      } else if (confirmAction.type === 'remove-challenge' && confirmAction.challengeId) {
        const current = (profile.visible_challenges || []) as string[];
        const updated = current.filter(c => c !== confirmAction.challengeId);
        const { error } = await supabase
          .from('profiles')
          .update({ visible_challenges: updated })
          .eq('user_id', confirmAction.profileId);
        if (error) throw error;
        toast({ title: 'Protocolo removido com sucesso' });
      }

      queryClient.invalidateQueries({ queryKey: ['admin-prescriptions-profiles'] });

      // Update selected profile if open
      if (selectedProfile?.user_id === confirmAction.profileId) {
        if (confirmAction.type === 'remove-map') {
          setSelectedProfile(prev => prev ? { ...prev, prescribed_map: null } : null);
        } else if (confirmAction.type === 'remove-challenge' && confirmAction.challengeId) {
          setSelectedProfile(prev => {
            if (!prev) return null;
            return { ...prev, visible_challenges: (prev.visible_challenges || []).filter(c => c !== confirmAction.challengeId) };
          });
        }
      }
    } catch (err: any) {
      toast({ title: 'Erro ao revogar prescrição', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
      setConfirmAction(null);
    }
  };

  const hasActiveFilters = filterMap !== 'all' || filterChallenge !== 'all';

  const unprescribedProfiles = useMemo(() => {
    const prescribed = new Set(prescribedProfiles.map(p => p.user_id));
    let list = profiles.filter(p => !prescribed.has(p.user_id));
    if (newPrescSearch) {
      const q = newPrescSearch.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q));
    }
    return list.slice(0, 20);
  }, [profiles, prescribedProfiles, newPrescSearch]);

  const handleSaveNewPrescription = async () => {
    if (!newPrescUserId) return;
    setSavingNew(true);
    try {
      const updates: Record<string, any> = {};
      if (newPrescMap !== 'none') updates.prescribed_map = newPrescMap;
      if (newPrescChallenges.length > 0) {
        const profile = profiles.find(p => p.user_id === newPrescUserId);
        const existing = (profile?.visible_challenges || []) as string[];
        updates.visible_challenges = [...new Set([...existing, ...newPrescChallenges])];
      }
      if (Object.keys(updates).length === 0) {
        toast({ title: 'Selecione ao menos um mapa ou protocolo', variant: 'destructive' });
        setSavingNew(false);
        return;
      }
      const { error } = await supabase.from('profiles').update(updates).eq('user_id', newPrescUserId);
      if (error) throw error;
      toast({ title: 'Prescrição adicionada com sucesso' });
      queryClient.invalidateQueries({ queryKey: ['admin-prescriptions-profiles'] });
      setShowNewPrescription(false);
      setNewPrescUserId(null);
      setNewPrescMap('none');
      setNewPrescChallenges([]);
      setNewPrescSearch('');
    } catch (err: any) {
      toast({ title: 'Erro ao prescrever', description: err.message, variant: 'destructive' });
    } finally {
      setSavingNew(false);
    }
  };

  const toggleNewPrescChallenge = (id: string) => {
    setNewPrescChallenges(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Prescrições</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral de mapas e protocolos prescritos para cada usuário ({prescribedProfiles.length} usuários com prescrições)
          </p>
        </div>
        <Button onClick={() => setShowNewPrescription(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Nova Prescrição
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        <div className="min-w-[180px]">
          <Select value={filterMap} onValueChange={setFilterMap}>
            <SelectTrigger className="bg-input border-border">
              <div className="flex items-center gap-2">
                <Map className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por mapa" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os mapas</SelectItem>
              {uniqueMapsInUse.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[180px]">
          <Select value={filterChallenge} onValueChange={setFilterChallenge}>
            <SelectTrigger className="bg-input border-border">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por protocolo" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os protocolos</SelectItem>
              {uniqueChallengesInUse.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFilterMap('all'); setFilterChallenge('all'); }}
            className="text-muted-foreground"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <p className="text-xs text-muted-foreground">
          <Filter className="w-3 h-3 inline mr-1" />
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Nenhum usuário com prescrições encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(profile => {
            const visibleChallenges = (profile.visible_challenges || []) as string[];
            return (
              <div
                key={profile.user_id}
                className="bg-card border border-border rounded-lg p-4 space-y-3 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setSelectedProfile(profile)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      profile.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{profile.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.status && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {profile.status}
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); setSelectedProfile(profile); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.prescribed_map && (
                    <Badge className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      {getMapIcon(profile.prescribed_map) || <Map className="w-3.5 h-3.5" />}
                      {getMapName(profile.prescribed_map)}
                    </Badge>
                  )}
                  {visibleChallenges.map(cId => (
                    <Badge key={cId} variant="outline" className="gap-1.5 text-xs">
                      {getChallengeIcon(cId) || <Trophy className="w-3 h-3" />}
                      {getChallengeName(cId)}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedProfile} onOpenChange={open => { if (!open) setSelectedProfile(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground overflow-hidden">
                {selectedProfile?.avatar ? (
                  <img src={selectedProfile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  selectedProfile?.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <div>
                <p className="text-base">{selectedProfile?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{selectedProfile?.email}</p>
              </div>
            </DialogTitle>
            <DialogDescription>Detalhes das prescrições do usuário</DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-4 mt-2">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="outline" className="capitalize">{selectedProfile.status || 'N/A'}</Badge>
              </div>

              {selectedProfile.updated_at && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Última atualização:</span>
                  <span className="text-sm">{new Date(selectedProfile.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              {/* Map */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Map className="w-4 h-4" /> Mapa Prescrito
                </h4>
                {selectedProfile.prescribed_map ? (
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      {getMapIcon(selectedProfile.prescribed_map) || <Map className="w-4 h-4 text-primary" />}
                      <span className="text-sm font-medium">{getMapName(selectedProfile.prescribed_map)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-7 text-xs"
                      onClick={() => setConfirmAction({ type: 'remove-map', profileId: selectedProfile.user_id })}
                    >
                      <X className="w-3 h-3 mr-1" /> Revogar
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum mapa prescrito</p>
                )}
              </div>

              {/* Challenges */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Trophy className="w-4 h-4" /> Protocolos Prescritos
                </h4>
                {(selectedProfile.visible_challenges || []).length > 0 ? (
                  <div className="space-y-1.5">
                    {(selectedProfile.visible_challenges || []).map(cId => (
                      <div key={cId} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          {getChallengeIcon(cId) || <Trophy className="w-4 h-4 text-muted-foreground" />}
                          <span className="text-sm font-medium">{getChallengeName(cId)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive h-7 text-xs"
                          onClick={() => setConfirmAction({ type: 'remove-challenge', profileId: selectedProfile.user_id, challengeId: cId })}
                        >
                          <X className="w-3 h-3 mr-1" /> Revogar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum protocolo prescrito</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={open => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar revogação</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'remove-map'
                ? 'Tem certeza que deseja remover o mapa prescrito deste usuário? Essa ação pode ser revertida prescrevendo novamente.'
                : 'Tem certeza que deseja remover este protocolo do usuário? Essa ação pode ser revertida prescrevendo novamente.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRevoke}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Prescription Modal */}
      <Dialog open={showNewPrescription} onOpenChange={open => { if (!open) { setShowNewPrescription(false); setNewPrescUserId(null); setNewPrescMap('none'); setNewPrescChallenges([]); setNewPrescSearch(''); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Nova Prescrição
            </DialogTitle>
            <DialogDescription>Selecione um usuário e atribua mapa e/ou protocolos</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Step 1: Select user */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Usuário</label>
              {newPrescUserId ? (
                <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {profiles.find(p => p.user_id === newPrescUserId)?.name || 'Usuário'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {profiles.find(p => p.user_id === newPrescUserId)?.email}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setNewPrescUserId(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar usuário sem prescrição..."
                      value={newPrescSearch}
                      onChange={e => setNewPrescSearch(e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-border rounded-lg p-1">
                    {unprescribedProfiles.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-3">Nenhum usuário encontrado</p>
                    ) : (
                      unprescribedProfiles.map(p => (
                        <button
                          key={p.user_id}
                          onClick={() => { setNewPrescUserId(p.user_id); setNewPrescSearch(''); }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground overflow-hidden shrink-0">
                            {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : p.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{p.name || 'Sem nome'}</p>
                            <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Select map */}
            {newPrescUserId && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Map className="w-4 h-4" /> Mapa
                  </label>
                  <Select value={newPrescMap} onValueChange={setNewPrescMap}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Selecionar mapa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {maps.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 3: Select challenges */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Protocolos
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                    {challenges.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">Nenhum protocolo disponível</p>
                    ) : (
                      challenges.map(c => (
                        <label
                          key={c.id}
                          className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        >
                          <Checkbox
                            checked={newPrescChallenges.includes(c.id)}
                            onCheckedChange={() => toggleNewPrescChallenge(c.id)}
                          />
                          <span className="text-sm">{c.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSaveNewPrescription}
                  disabled={savingNew || (newPrescMap === 'none' && newPrescChallenges.length === 0)}
                  className="w-full gap-2"
                >
                  {savingNew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Salvar Prescrição
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPrescriptionsPanel;
