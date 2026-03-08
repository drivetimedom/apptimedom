import React from 'react';
import { useCalendarEvents, generateOccurrences, CalendarEvent } from '@/hooks/useCalendarEvents';
import { CalendarDays, Clock, MapPin, Link, Repeat, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CalendarSection: React.FC = () => {
  const { events, isLoading } = useCalendarEvents();

  // Generate upcoming occurrences for next 3 months
  const now = new Date();
  const rangeEnd = addMonths(now, 3);

  const upcomingOccurrences = events
    .filter(e => e.active)
    .flatMap(event => generateOccurrences(event, now, rangeEnd))
    .sort((a, b) => a.occurrence_date.localeCompare(b.occurrence_date));

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Carregando agenda...</p>;
  }

  if (upcomingOccurrences.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Nenhum evento agendado.</p>
      </div>
    );
  }

  // Group by month
  const grouped: Record<string, typeof upcomingOccurrences> = {};
  upcomingOccurrences.forEach(occ => {
    const monthKey = format(new Date(occ.occurrence_date + 'T00:00:00'), 'yyyy-MM');
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(occ);
  });

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([monthKey, occs]) => (
        <div key={monthKey}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {format(new Date(monthKey + '-01T00:00:00'), "MMMM 'de' yyyy", { locale: ptBR })}
          </h3>
          <div className="space-y-3">
            {occs.map((occ, idx) => (
              <div
                key={`${occ.id}-${idx}`}
                className="flex gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
              >
                {/* Date badge */}
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-primary leading-none">
                    {format(new Date(occ.occurrence_date + 'T00:00:00'), 'dd')}
                  </span>
                  <span className="text-xs text-primary/70 uppercase">
                    {format(new Date(occ.occurrence_date + 'T00:00:00'), 'EEE', { locale: ptBR })}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground">{occ.title}</h4>
                    {occ.is_recurring && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Repeat className="w-3 h-3" />
                        {occ.recurrence_type === 'weekly' ? 'Semanal' : occ.recurrence_type === 'biweekly' ? 'Quinzenal' : 'Mensal'}
                      </Badge>
                    )}
                  </div>

                  {occ.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{occ.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    {occ.event_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {occ.event_time.slice(0, 5)}
                        {occ.end_time && ` - ${occ.end_time.slice(0, 5)}`}
                      </span>
                    )}
                    {occ.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {occ.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Meeting link */}
                {occ.meeting_link && (
                  <div className="flex-shrink-0 self-center">
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <a href={occ.meeting_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Acessar
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarSection;
