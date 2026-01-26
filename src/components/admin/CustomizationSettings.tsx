import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
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
import {
  Palette,
  Image,
  Type,
  BookOpen,
  RotateCcw,
  Save,
  Upload,
  Eye,
  Check,
} from 'lucide-react';
import { 
  Customization, 
  defaultCustomization, 
  colorPalettes, 
  availableFonts,
  getCustomization,
  saveCustomization,
  applyCustomization,
} from '@/lib/customization';
import { getFromStorage, STORAGE_KEYS, Course } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const CustomizationSettings: React.FC = () => {
  const { toast } = useToast();
  const [customization, setCustomization] = useState<Customization>(getCustomization);
  const [activeTab, setActiveTab] = useState('colors');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [courses] = useState(() => getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string>('');

  // Apply changes in real-time for preview
  useEffect(() => {
    applyCustomization(customization);
  }, [customization]);

  // Update color
  const updateColor = (key: keyof typeof customization.colors, value: string) => {
    setCustomization(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
  };

  // Apply palette
  const applyPalette = (paletteKey: string) => {
    const palette = colorPalettes[paletteKey];
    if (palette) {
      setCustomization(prev => ({
        ...prev,
        colors: { ...palette },
      }));
      toast({ title: 'Paleta aplicada!' });
    }
  };

  // Update branding
  const updateBranding = (key: keyof typeof customization.branding, value: string | null) => {
    setCustomization(prev => ({
      ...prev,
      branding: { ...prev.branding, [key]: value },
    }));
  };

  // Update texts
  const updateText = (key: keyof typeof customization.texts, value: string) => {
    setCustomization(prev => ({
      ...prev,
      texts: { ...prev.texts, [key]: value },
    }));
  };

  // Update font
  const updateFont = (key: keyof typeof customization.font, value: string) => {
    setCustomization(prev => ({
      ...prev,
      font: { ...prev.font, [key]: value },
    }));
  };

  // Update course cover
  const updateCourseCover = (courseId: string, coverUrl: string) => {
    setCustomization(prev => ({
      ...prev,
      courseCovers: { ...prev.courseCovers, [courseId]: coverUrl },
    }));
  };

  // Handle file upload for images
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande. Máximo 2MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      
      if (uploadTarget.startsWith('course-')) {
        updateCourseCover(uploadTarget, base64);
      } else {
        updateBranding(uploadTarget as keyof typeof customization.branding, base64);
      }
      
      toast({ title: 'Imagem carregada!' });
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = (target: string) => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  // Save all changes
  const handleSave = () => {
    saveCustomization(customization);
    applyCustomization(customization);
    toast({ title: 'Personalizações salvas!' });
  };

  // Reset to default
  const handleReset = () => {
    setCustomization(defaultCustomization);
    saveCustomization(defaultCustomization);
    applyCustomization(defaultCustomization);
    setResetConfirmOpen(false);
    toast({ title: 'Personalização resetada!' });
  };

  // Color picker component
  const ColorPicker = ({ 
    label, 
    colorKey, 
    value 
  }: { 
    label: string; 
    colorKey: keyof typeof customization.colors; 
    value: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-foreground">{label}</Label>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border border-border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-${colorKey}`)?.click()}
        />
        <input
          id={`color-${colorKey}`}
          type="color"
          value={value}
          onChange={(e) => updateColor(colorKey, e.target.value)}
          className="sr-only"
        />
        <Input
          value={value}
          onChange={(e) => updateColor(colorKey, e.target.value)}
          className="flex-1 bg-input border-border font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Personalização Visual</h2>
          <p className="text-muted-foreground">Customize cores, logos, textos e aparência</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setResetConfirmOpen(true)} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Resetar
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card border border-border mb-6">
              <TabsTrigger value="colors" className="gap-2 data-[state=active]:bg-accent">
                <Palette className="w-4 h-4" />
                Cores
              </TabsTrigger>
              <TabsTrigger value="logos" className="gap-2 data-[state=active]:bg-accent">
                <Image className="w-4 h-4" />
                Logos
              </TabsTrigger>
              <TabsTrigger value="texts" className="gap-2 data-[state=active]:bg-accent">
                <Type className="w-4 h-4" />
                Textos
              </TabsTrigger>
              <TabsTrigger value="covers" className="gap-2 data-[state=active]:bg-accent">
                <BookOpen className="w-4 h-4" />
                Capas
              </TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Tema Base</h3>
                <RadioGroup 
                  value={customization.theme} 
                  onValueChange={(v) => setCustomization(prev => ({ ...prev, theme: v as any }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark">Escuro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light">Claro</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="theme-custom" />
                    <Label htmlFor="theme-custom">Personalizado</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Cores Personalizadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ColorPicker label="Cor Principal (Botões)" colorKey="primary" value={customization.colors.primary} />
                  <ColorPicker label="Cor Secundária (Destaques)" colorKey="secondary" value={customization.colors.secondary} />
                  <ColorPicker label="Cor de Acento" colorKey="accent" value={customization.colors.accent} />
                  <ColorPicker label="Background" colorKey="background" value={customization.colors.background} />
                  <ColorPicker label="Background dos Cards" colorKey="cardBackground" value={customization.colors.cardBackground} />
                  <ColorPicker label="Texto Principal" colorKey="textPrimary" value={customization.colors.textPrimary} />
                  <ColorPicker label="Texto Secundário" colorKey="textSecondary" value={customization.colors.textSecondary} />
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Paletas Prontas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(colorPalettes).map(([key, palette]) => (
                    <button
                      key={key}
                      onClick={() => applyPalette(key)}
                      className="p-3 rounded-lg border border-border hover:border-primary transition-colors text-left"
                    >
                      <div className="flex gap-1 mb-2">
                        {Object.values(palette).slice(0, 4).map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-foreground capitalize">
                        {key.replace(/-/g, ' ')}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Tipografia</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Família de Fonte</Label>
                    <RadioGroup 
                      value={customization.font.family}
                      onValueChange={(v) => updateFont('family', v)}
                      className="space-y-2"
                    >
                      {availableFonts.map(font => (
                        <div key={font} className="flex items-center space-x-2">
                          <RadioGroupItem value={font} id={`font-${font}`} />
                          <Label htmlFor={`font-${font}`} style={{ fontFamily: font }}>
                            {font}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Tamanho Base</Label>
                    <RadioGroup 
                      value={customization.font.size}
                      onValueChange={(v) => updateFont('size', v)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="small" id="size-small" />
                        <Label htmlFor="size-small">Pequeno (14px)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="size-medium" />
                        <Label htmlFor="size-medium">Médio (16px)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="large" id="size-large" />
                        <Label htmlFor="size-large">Grande (18px)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Logos Tab */}
            <TabsContent value="logos" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Logo Principal (Header)</h3>
                <div className="space-y-4">
                  {customization.branding.logoUrl && (
                    <div className="bg-accent/30 rounded-lg p-4 flex items-center justify-center">
                      <img 
                        src={customization.branding.logoUrl} 
                        alt="Logo" 
                        className="max-h-16 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Input
                      value={customization.branding.logoUrl || ''}
                      onChange={(e) => updateBranding('logoUrl', e.target.value || null)}
                      placeholder="URL da imagem..."
                      className="flex-1 bg-input border-border"
                    />
                    <Button variant="outline" onClick={() => triggerUpload('logoUrl')} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Recomendado: 200x60px, PNG transparente</p>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Logo da Tela de Login</h3>
                <div className="space-y-4">
                  {customization.branding.logoLoginUrl && (
                    <div className="bg-accent/30 rounded-lg p-4 flex items-center justify-center">
                      <img 
                        src={customization.branding.logoLoginUrl} 
                        alt="Logo Login" 
                        className="max-h-24 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Input
                      value={customization.branding.logoLoginUrl || ''}
                      onChange={(e) => updateBranding('logoLoginUrl', e.target.value || null)}
                      placeholder="URL da imagem..."
                      className="flex-1 bg-input border-border"
                    />
                    <Button variant="outline" onClick={() => triggerUpload('logoLoginUrl')} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Recomendado: 300x100px</p>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Favicon</h3>
                <div className="space-y-4">
                  {customization.branding.faviconUrl && (
                    <div className="bg-accent/30 rounded-lg p-4 flex items-center justify-center">
                      <img 
                        src={customization.branding.faviconUrl} 
                        alt="Favicon" 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Input
                      value={customization.branding.faviconUrl || ''}
                      onChange={(e) => updateBranding('faviconUrl', e.target.value || null)}
                      placeholder="URL da imagem..."
                      className="flex-1 bg-input border-border"
                    />
                    <Button variant="outline" onClick={() => triggerUpload('faviconUrl')} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Formato: .ico ou .png 32x32px</p>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Banner da Home</h3>
                <div className="space-y-4">
                  {customization.branding.bannerUrl && (
                    <div className="bg-accent/30 rounded-lg p-2">
                      <img 
                        src={customization.branding.bannerUrl} 
                        alt="Banner" 
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Input
                      value={customization.branding.bannerUrl || ''}
                      onChange={(e) => updateBranding('bannerUrl', e.target.value || null)}
                      placeholder="URL da imagem..."
                      className="flex-1 bg-input border-border"
                    />
                    <Button variant="outline" onClick={() => triggerUpload('bannerUrl')} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Recomendado: 1920x600px</p>
                </div>
              </div>
            </TabsContent>

            {/* Texts Tab */}
            <TabsContent value="texts" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Textos Gerais</h3>
                
                <div className="space-y-2">
                  <Label>Título do Site</Label>
                  <Input
                    value={customization.texts.siteTitle}
                    onChange={(e) => updateText('siteTitle', e.target.value)}
                    placeholder="Minha Área de Membros"
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground">Aparece no header e título da página</p>
                </div>

                <div className="space-y-2">
                  <Label>Mensagem de Boas-Vindas</Label>
                  <Input
                    value={customization.texts.welcomeMessage}
                    onChange={(e) => updateText('welcomeMessage', e.target.value)}
                    placeholder="Bem-vindo!"
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Tela de Login</h3>
                
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={customization.texts.loginTitle}
                    onChange={(e) => updateText('loginTitle', e.target.value)}
                    placeholder="Faça seu login"
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={customization.texts.loginSubtitle}
                    onChange={(e) => updateText('loginSubtitle', e.target.value)}
                    placeholder="Acesse sua conta para continuar"
                    className="bg-input border-border"
                  />
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Rodapé</h3>
                
                <div className="space-y-2">
                  <Label>Texto do Rodapé</Label>
                  <Textarea
                    value={customization.texts.footerText}
                    onChange={(e) => updateText('footerText', e.target.value)}
                    placeholder="© 2026 Todos os direitos reservados"
                    className="bg-input border-border"
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Covers Tab */}
            <TabsContent value="covers" className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Capa Padrão</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta capa será usada quando um curso não tiver capa específica.
                </p>
                <div className="space-y-4">
                  {customization.courseCovers['default'] && (
                    <div className="bg-accent/30 rounded-lg p-2 w-40">
                      <img 
                        src={customization.courseCovers['default']} 
                        alt="Capa Padrão" 
                        className="w-full aspect-[2/3] object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Input
                      value={customization.courseCovers['default'] || ''}
                      onChange={(e) => updateCourseCover('default', e.target.value)}
                      placeholder="URL da imagem..."
                      className="flex-1 bg-input border-border"
                    />
                    <Button variant="outline" onClick={() => triggerUpload('course-default')} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Recomendado: 400x600px (proporção 2:3)</p>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Capas Individuais</h3>
                <div className="space-y-4">
                  {courses.map(course => (
                    <div key={course.id} className="flex items-start gap-4 p-4 bg-accent/20 rounded-lg">
                      <div className="w-20 shrink-0">
                        <img
                          src={customization.courseCovers[course.id] || course.thumbnail || '/placeholder.svg'}
                          alt={course.title}
                          className="w-full aspect-[2/3] object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{course.title}</p>
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={customization.courseCovers[course.id] || ''}
                            onChange={(e) => updateCourseCover(course.id, e.target.value)}
                            placeholder="URL da capa..."
                            className="flex-1 bg-input border-border text-sm"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => triggerUpload(`course-${course.id}`)}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Pré-visualização</h3>
            </div>
            
            <div 
              className="rounded-lg overflow-hidden border border-border"
              style={{ backgroundColor: customization.colors.background }}
            >
              {/* Mini Login Preview */}
              <div className="p-4 flex flex-col items-center">
                {customization.branding.logoLoginUrl ? (
                  <img 
                    src={customization.branding.logoLoginUrl} 
                    alt="Logo" 
                    className="h-8 object-contain mb-3"
                  />
                ) : (
                  <div 
                    className="text-lg font-bold mb-3"
                    style={{ color: customization.colors.textPrimary }}
                  >
                    {customization.texts.siteTitle}
                  </div>
                )}
                
                <p 
                  className="text-sm font-medium mb-1"
                  style={{ color: customization.colors.textPrimary }}
                >
                  {customization.texts.loginTitle}
                </p>
                <p 
                  className="text-xs mb-3"
                  style={{ color: customization.colors.textSecondary }}
                >
                  {customization.texts.loginSubtitle}
                </p>
                
                <div 
                  className="w-full h-8 rounded text-xs flex items-center justify-center font-medium"
                  style={{ 
                    backgroundColor: customization.colors.primary,
                    color: customization.colors.background,
                  }}
                >
                  Entrar
                </div>
              </div>

              {/* Mini Card Preview */}
              <div 
                className="p-3 m-3 rounded-lg"
                style={{ backgroundColor: customization.colors.cardBackground }}
              >
                <div 
                  className="w-full h-16 rounded mb-2"
                  style={{ backgroundColor: customization.colors.accent + '40' }}
                />
                <p 
                  className="text-sm font-medium"
                  style={{ color: customization.colors.textPrimary }}
                >
                  Exemplo de Curso
                </p>
                <p 
                  className="text-xs"
                  style={{ color: customization.colors.textSecondary }}
                >
                  Descrição do curso
                </p>
                <div 
                  className="mt-2 px-2 py-1 rounded text-xs inline-block"
                  style={{ 
                    backgroundColor: customization.colors.secondary + '30',
                    color: customization.colors.secondary,
                  }}
                >
                  Tag
                </div>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4 text-center">
              As alterações são aplicadas em tempo real
            </p>
          </div>
        </div>
      </div>

      {/* Reset Confirmation */}
      <AlertDialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Resetar Personalização</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar as configurações padrão? Todas as suas personalizações serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, Resetar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomizationSettings;
