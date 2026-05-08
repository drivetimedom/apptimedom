import React, { useMemo, useState } from 'react';
import { useCalendarEvents, generateOccurrences } from '@/hooks/useCalendarEvents';
import { CalendarDays, Clock, MapPin, Repeat, ExternalLink, List, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format, addMonths, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type Occurrence = ReturnType<typeof generateOccurrences>[number];

const CalendarSection: React.FC = () => {
  const { events, isLoading } = useCalendarEvents();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [month, setMonth] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Occurrence | null>(null);

  const occurrences = useMemo(() => {
    const rangeStart = startOfMonth(addMonths(month, -1));
    const rangeEnd = endOfMonth(addMonths(month, 6));
    return events
      .filter(e => e.active)
      .flatMap(event => generateOccurrences(event, rangeStart, rangeEnd))
      .sort((a, b) => a.occurrence_date.localeCompare(b.occurrence_date));
  }, [events, month]);

  const eventDates = useMemo(
    () => occurrences.map(o => new Date(o.occurrence_date + 'T00:00:00')),
    [occurrences]
  );

  const occurrencesByDay = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    occurrences.forEach(o => {
      const key = o.occurrence_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(o);
    });
    return map;
  }, [occurrences]);

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Carregando agenda...</p>;
  }

  const handleDayClick = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    const dayOccs = occurrencesByDay.get(key);
    if (dayOccs && dayOccs.length > 0) {
      setSelected(dayOccs[0]);
    }
  };

  const upcomingForMonth = occurrences.filter(o => {
    const d = new Date(o.occurrence_date + 'T00:00:00');
    return d >= startOfMonth(month) && d <= endOfMonth(month);
  });

  return (
    <div className="space-y-6">
      {/* View toggle */}
      <div className="flex items-center justify-end gap-1 bg-muted/50 rounded-lg p-1 w-fit ml-auto">
        <Button
          variant={view === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('calendar')}
          className="gap-1.5 h-8"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          Calendário
        </Button>
        <Button
          variant={view === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setView('list')}
          className="gap-1.5 h-8"
        >
          <List className="w-3.5 h-3.5" />
          Lista
        </Button>
      </div>

      {view === 'calendar' ? (
        <div className="grid lg:grid-cols-[auto,1fr] gap-6 items-start">
          {/* Calendar */}
          <div className="rounded-xl border border-border bg-card p-2 mx-auto">
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              onDayClick={handleDayClick}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{
                hasEvent:
                  'relative font-semibold text-primary after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary',
              }}
              locale={ptBR}
              className={cn('p-3 pointer-events-auto')}
            />
          </div>

          {/* Side list for selected month */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {format(month, "MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            {upcomingForMonth.length === 0 ? (
              <div className="text-center py-12 rounded-lg border border-dashed border-border">
                <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum evento neste mês.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingForMonth.map((occ, idx) => (
                  <button
                    key={`${occ.id}-${idx}`}
                    onClick={() => setSelected(occ)}
                    className="w-full text-left flex gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                      <span className="text-base font-bold text-primary leading-none">
                        {format(new Date(occ.occurrence_date + 'T00:00:00'), 'dd')}
                      </span>
                      <span className="text-[10px] text-primary/70 uppercase">
                        {format(new Date(occ.occurrence_date + 'T00:00:00'), 'EEE', { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{occ.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {occ.event_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {occ.event_time.slice(0, 5)}
                          </span>
                        )}
                        {occ.location && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3" />
                            {occ.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <ListView occurrences={occurrences} onSelect={setSelected} />
      )}

      {/* Event details modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {selected.title}
                  {selected.is_recurring && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Repeat className="w-3 h-3" />
                      {selected.recurrence_type === 'weekly'
                        ? 'Semanal'
                        : selected.recurrence_type === 'biweekly'
                        ? 'Quinzenal'
                        : 'Mensal'}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {format(
                    new Date(selected.occurrence_date + 'T00:00:00'),
                    "EEEE, dd 'de' MMMM 'de' yyyy",
                    { locale: ptBR }
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                {selected.event_time && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {selected.event_time.slice(0, 5)}
                      {selected.end_time && ` — ${selected.end_time.slice(0, 5)}`}
                    </span>
                  </div>
                )}
                {selected.location && (
                  <div className="flex items-start gap-2 text-foreground">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{selected.location}</span>
                  </div>
                )}
                {selected.description && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-muted-foreground whitespace-pre-wrap">{selected.description}</p>
                  </div>
                )}
                {selected.meeting_link && (
                  <Button asChild className="w-full gap-2 mt-2">
                    <a href={selected.meeting_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Acessar reunião
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ListView: React.FC<{ occurrences: Occurrence[]; onSelect: (o: Occurrence) => void }> = ({
  occurrences,
  onSelect,
}) => {
  const now = new Date();
  const upcoming = occurrences.filter(o => new Date(o.occurrence_date + 'T00:00:00') >= new Date(now.toDateString()));

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Nenhum evento agendado.</p>
      </div>
    );
  }

  const grouped: Record<string, Occurrence[]> = {};
  upcoming.forEach(occ => {
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
              <button
                key={`${occ.id}-${idx}`}
                onClick={() => onSelect(occ)}
                className="w-full text-left flex gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/40 transition-colors"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-primary leading-none">
                    {format(new Date(occ.occurrence_date + 'T00:00:00'), 'dd')}
                  </span>
                  <span className="text-xs text-primary/70 uppercase">
                    {format(new Date(occ.occurrence_date + 'T00:00:00'), 'EEE', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground">{occ.title}</h4>
                    {occ.is_recurring && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Repeat className="w-3 h-3" />
                        {occ.recurrence_type === 'weekly'
                          ? 'Semanal'
                          : occ.recurrence_type === 'biweekly'
                          ? 'Quinzenal'
                          : 'Mensal'}
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
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarSection;
