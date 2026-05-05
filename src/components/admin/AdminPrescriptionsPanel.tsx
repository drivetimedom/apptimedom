import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Map, Trophy, User, Loader2 } from 'lucide-react';
import { getLucideIcon } from '@/lib/iconMap';
import { useHofMaps } from '@/hooks/useHofMaps';
import { useHofChallenges } from '@/hooks/useHofChallenges';

const AdminPrescriptionsPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: maps = [] } = useHofMaps();
  const { data: challenges = [] } = useHofChallenges();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin-prescriptions-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, email, avatar, prescribed_map, visible_challenges, status')
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  // Only show users that have at least one prescription
  const prescribedProfiles = useMemo(() => {
    return profiles.filter(p => 
      (p.prescribed_map && p.prescribed_map !== '') || 
      (p.visible_challenges && (p.visible_challenges as string[]).length > 0)
    );
  }, [profiles]);

  const filtered = useMemo(() => {
    if (!search) return prescribedProfiles;
    const q = search.toLowerCase();
    return prescribedProfiles.filter(p =>
      p.name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
    );
  }, [prescribedProfiles, search]);

  const getMapName = (mapId: string) => {
    const map = maps.find(m => m.id === mapId);
    return map ? map.name : mapId;
  };

  const getMapIcon = (mapId: string) => {
    const map = maps.find(m => m.id === mapId);
    if (!map) return null;
    const Icon = getLucideIcon(map.icon);
    return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
  };

  const getChallengeName = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    return challenge ? challenge.name : challengeId;
  };

  const getChallengeIcon = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return null;
    const Icon = getLucideIcon(challenge.icon);
    return Icon ? <Icon className="w-3 h-3" /> : null;
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
      <div>
        <h2 className="text-xl font-semibold text-foreground">Prescrições</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral de mapas e protocolos prescritos para cada usuário ({prescribedProfiles.length} usuários com prescrições)
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-input border-border"
        />
      </div>

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
                className="bg-card border border-border rounded-lg p-4 space-y-3"
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
                  {profile.status && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {profile.status}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.prescribed_map && (
                    <Badge className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      {getMapIcon(profile.prescribed_map) || <Map className="w-3.5 h-3.5" />}
                      {getMapName(profile.prescribed_map)}
                    </Badge>
                  )}
                  {visibleChallenges.map(cId => (
                    <Badge
                      key={cId}
                      variant="outline"
                      className="gap-1.5 text-xs"
                    >
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
    </div>
  );
};

export default AdminPrescriptionsPanel;
