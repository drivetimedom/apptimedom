import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Save, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PersonalDataTab: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Password modal state
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSaveProfile = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim(), bio: bio.trim(), instagram: instagram.trim() })
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas com sucesso.' });
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível salvar o perfil.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo de 2MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);

      const avatarUrl = `${publicUrl}?t=${Date.now()}`;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      await refreshProfile();
      toast({ title: 'Avatar atualizado!' });
    } catch {
      toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: 'Senha muito curta', description: 'Mínimo de 8 caracteres.', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Senhas não conferem', variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: 'Senha alterada com sucesso!' });
      setPasswordOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast({ title: 'Erro ao alterar senha', variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Avatar Section */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={profile?.avatar || undefined} />
                <AvatarFallback className="bg-accent text-foreground text-2xl">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-foreground" /> : <Camera className="w-6 h-6 text-foreground" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-foreground">{profile?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Membro desde {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="bg-input border-border" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled className="bg-muted border-border text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@seuperfil" className="bg-input border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Conte um pouco sobre você..." className="bg-input border-border resize-none" rows={3} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={handleSaveProfile} disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>

            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Alterar Senha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Nova Senha</Label>
                    <div className="relative">
                      <Input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-input border-border pr-10" />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-input border-border pr-10" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full">
                    {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Confirmar Alteração
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalDataTab;
