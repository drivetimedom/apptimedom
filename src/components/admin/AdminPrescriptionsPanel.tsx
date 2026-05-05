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
    let list = prescribedProfiles;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
      );
    }

    if (filterMap !== 'all') {
      list = list.filter(p => p.prescribed_map === filterMap);
    }

    if (filterChallenge !== 'all') {
      list = list.filter(p => (p.visible_challenges || []).includes(filterChallenge));
    }

    return list;
  }, [prescribedProfiles, search, filterMap, filterChallenge]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Prescrições</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral de mapas e protocolos prescritos para cada usuário ({prescribedProfiles.length} usuários com prescrições)
        </p>
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
    </div>
  );
};

export default AdminPrescriptionsPanel;
