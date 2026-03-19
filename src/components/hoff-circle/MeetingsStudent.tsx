import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePartnershipIds } from '@/hooks/usePartnerships';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, Play, Calendar, Clock, X } from 'lucide-react';

interface MeetingsStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeetingsStudentModal: React.FC<MeetingsStudentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { data: partnerIds } = usePartnershipIds(user?.id);
  const [selectedRecording, setSelectedRecording] = useState<any>(null);

  const { data: recordings = [], isLoading } = useQuery({
    queryKey: ['my-meetings', user?.id, partnerIds],
    queryFn: async () => {
      if (!user?.id || !partnerIds) return [];
      const { data, error } = await supabase
        .from('meeting_recordings')
        .select('*')
        .in('user_id', partnerIds)
        .order('meeting_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!partnerIds && isOpen,
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Video className="w-5 h-5 text-primary" />
              Reuniões Individuais
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando gravações...</p>
            ) : recordings.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Gravações das suas reuniões com o mentor:
                </p>
                {recordings.map((recording: any) => (
                  <div
                    key={recording.id}
                    className="border border-border rounded-lg p-4 space-y-2"
                  >
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Video className="w-4 h-4 text-primary" />
                      {recording.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(recording.meeting_date).toLocaleDateString('pt-BR')}
                      </span>
                      {recording.duration_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recording.duration_minutes} min
                        </span>
                      )}
                    </p>
                    {recording.description && (
                      <p className="text-sm text-muted-foreground">{recording.description}</p>
                    )}
                    <Button
                      className="w-full gap-2"
                      onClick={() => setSelectedRecording(recording)}
                    >
                      <Play className="w-4 h-4" />
                      Assistir Gravação
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma gravação disponível ainda
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Player Modal */}
      <Dialog open={!!selectedRecording} onOpenChange={() => setSelectedRecording(null)}>
        <DialogContent className="bg-card border-border max-w-4xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-foreground">{selectedRecording?.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedRecording && new Date(selectedRecording.meeting_date).toLocaleDateString('pt-BR')}
            </p>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-b-lg overflow-hidden">
            {selectedRecording?.vimeo_id && (
              <iframe
                src={`https://player.vimeo.com/video/${selectedRecording.vimeo_id}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          {selectedRecording?.description && (
            <div className="p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">{selectedRecording.description}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MeetingsStudentModal;
