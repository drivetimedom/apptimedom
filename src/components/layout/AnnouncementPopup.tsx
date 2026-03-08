import React, { useState } from 'react';
import { useActiveAnnouncements, useDismissAnnouncement } from '@/hooks/useAnnouncements';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone, ChevronLeft, ChevronRight, X } from 'lucide-react';

const AnnouncementPopup: React.FC = () => {
  const { data: announcements = [] } = useActiveAnnouncements();
  const dismissMutation = useDismissAnnouncement();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];
  if (!current) return null;

  const handleDismiss = () => {
    dismissMutation.mutate(current.id);
    if (currentIndex < announcements.length - 1) {
      // Move to next
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleDismissAll = () => {
    announcements.forEach(a => dismissMutation.mutate(a.id));
  };

  return (
    <Dialog open={true} onOpenChange={() => handleDismiss()}>
      <DialogContent className="bg-card border-border max-w-md sm:max-w-lg p-0 overflow-hidden">
        <div className="relative">
          {current.image_url && (
            <img
              src={current.image_url}
              alt=""
              className="w-full max-h-64 object-cover"
            />
          )}
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Megaphone className="w-5 h-5 text-primary flex-shrink-0" />
                {current.title}
              </DialogTitle>
            </DialogHeader>
            {current.content && (
              <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">
                {current.content}
              </p>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                {announcements.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex(currentIndex - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {currentIndex + 1} de {announcements.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={currentIndex === announcements.length - 1}
                      onClick={() => setCurrentIndex(currentIndex + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {announcements.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={handleDismissAll} className="text-xs">
                    Dispensar todos
                  </Button>
                )}
                <Button size="sm" onClick={handleDismiss}>
                  Entendi
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementPopup;
