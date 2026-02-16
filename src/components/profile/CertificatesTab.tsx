import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Download, Share2, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CertificatesTab: React.FC = () => {
  const { user } = useAuth();

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['my-certificates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*, courses(title, thumbnail)')
        .eq('user_id', user!.id)
        .order('issued_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const handleShare = async (cert: any) => {
    const text = `Certificado de conclusão: ${cert.courses?.title}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meu Certificado', text, url: cert.certificate_url || '' });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(cert.certificate_url || text);
      toast({ title: 'Link copiado!' });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  if (!certificates?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <Award className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Nenhum certificado ainda</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Complete seus cursos para receber certificados de conclusão.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      {certificates.map((cert: any) => (
        <Card key={cert.id} className="bg-card border-border overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-warning to-success" />
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Award className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{cert.courses?.title}</p>
                <p className="text-xs text-muted-foreground">Nº {cert.certificate_number || '—'}</p>
                <p className="text-xs text-muted-foreground">
                  Emitido em {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {cert.certificate_url && (
                <Button size="sm" variant="outline" className="flex-1" asChild>
                  <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Ver
                  </a>
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => handleShare(cert)}>
                <Share2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CertificatesTab;
