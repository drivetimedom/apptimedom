import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { sendNotification } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { addDays, addWeeks, addMonths, startOfDay, endOfDay, isBefore, isAfter, format } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  end_time: string | null;
  location: string | null;
  meeting_link: string | null;
  is_recurring: boolean;
  recurrence_type: string | null;
  recurrence_day: number | null;
  recurrence_end_date: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  end_time?: string;
  location?: string;
  meeting_link?: string;
  is_recurring: boolean;
  recurrence_type?: string;
  recurrence_day?: number;
  recurrence_end_date?: string;
  active?: boolean;
}

// Generate occurrences for recurring events
export function generateOccurrences(event: CalendarEvent, rangeStart: Date, rangeEnd: Date) {
  if (!event.is_recurring || !event.recurrence_type) {
    const eventDate = new Date(event.event_date + 'T00:00:00');
    if (eventDate >= rangeStart && eventDate <= rangeEnd) {
      return [{ ...event, occurrence_date: event.event_date }];
    }
    return [];
  }

  const occurrences: (CalendarEvent & { occurrence_date: string })[] = [];
  let currentDate = new Date(event.event_date + 'T00:00:00');
  const endDate = event.recurrence_end_date
    ? new Date(event.recurrence_end_date + 'T00:00:00')
    : rangeEnd;

  while (currentDate <= endDate && currentDate <= rangeEnd) {
    if (currentDate >= rangeStart) {
      occurrences.push({
        ...event,
        occurrence_date: format(currentDate, 'yyyy-MM-dd'),
      });
    }

    switch (event.recurrence_type) {
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'biweekly':
        currentDate = addWeeks(currentDate, 2);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      default:
        currentDate = addDays(currentDate, 365);
    }
  }

  return occurrences;
}

export function useCalendarEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  const createEvent = useMutation({
    mutationFn: async (input: CalendarEventInput) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({ title: 'Evento criado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar evento', variant: 'destructive' });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...input }: CalendarEventInput & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({ title: 'Evento atualizado!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar evento', variant: 'destructive' });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({ title: 'Evento removido!' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover evento', variant: 'destructive' });
    },
  });

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
