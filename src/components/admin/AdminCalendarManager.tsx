import React, { useState } from 'react';
import { useCalendarEvents, CalendarEvent, CalendarEventInput } from '@/hooks/useCalendarEvents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, Edit, Trash2, Clock, MapPin, Link, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const emptyForm: CalendarEventInput = {
  title: '',
  description: '',
  event_date: '',
  event_time: '',
  end_time: '',
  location: '',
  meeting_link: '',
  is_recurring: false,
  recurrence_type: undefined,
  recurrence_day: undefined,
  recurrence_end_date: undefined,
};

const AdminCalendarManager: React.FC = () => {
  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useCalendarEvents();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState<CalendarEventInput>(emptyForm);

  const openCreate = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      event_time: event.event_time || '',
      end_time: event.end_time || '',
      location: event.location || '',
      meeting_link: event.meeting_link || '',
      is_recurring: event.is_recurring,
      recurrence_type: event.recurrence_type || undefined,
      recurrence_day: event.recurrence_day ?? undefined,
      recurrence_end_date: event.recurrence_end_date || undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.event_date) return;

    const payload = {
      ...form,
      event_time: form.event_time || null,
      end_time: form.end_time || null,
      location: form.location || null,
      meeting_link: form.meeting_link || null,
      recurrence_type: form.is_recurring ? form.recurrence_type : null,
      recurrence_day: form.is_recurring ? form.recurrence_day : null,
      recurrence_end_date: form.is_recurring ? form.recurrence_end_date : null,
    };

    if (editingEvent) {
      await updateEvent.mutateAsync({ id: editingEvent.id, ...payload });
    } else {
      await createEvent.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  const recurrenceLabel = (type: string | null) => {
    switch (type) {
      case 'weekly': return 'Semanal';
      case 'biweekly': return 'Quinzenal';
      case 'monthly': return 'Mensal';
      default: return 'Único';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Calendário de Eventos</h2>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Evento
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando eventos...</p>
      ) : events.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Nenhum evento cadastrado.</p>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id} className={`${!event.active ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{event.title}</h3>
                      {event.is_recurring && (
                        <Badge variant="secondary" className="gap-1">
                          <Repeat className="w-3 h-3" />
                          {recurrenceLabel(event.recurrence_type)}
                        </Badge>
                      )}
                      {!event.active && <Badge variant="outline">Inativo</Badge>}
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {format(new Date(event.event_date + 'T00:00:00'), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </span>
                      {event.event_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {event.event_time.slice(0, 5)}
                          {event.end_time && ` - ${event.end_time.slice(0, 5)}`}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </span>
                      )}
                      {event.meeting_link && (
                        <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <Link className="w-3.5 h-3.5" />
                          Link da reunião
                        </a>
                      )}
                    </div>

                    {event.is_recurring && event.recurrence_end_date && (
                      <p className="text-xs text-muted-foreground">
                        Recorrência até {format(new Date(event.recurrence_end_date + 'T00:00:00'), "dd/MM/yyyy")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(event)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteEvent.mutate(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nome do evento"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Detalhes do evento"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={form.event_time || ''}
                  onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Horário de término</Label>
              <Input
                type="time"
                value={form.end_time || ''}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>

            <div>
              <Label>Local</Label>
              <Input
                value={form.location || ''}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ex: Zoom, Google Meet, Presencial"
              />
            </div>

            <div>
              <Label>Link da reunião</Label>
              <Input
                value={form.meeting_link || ''}
                onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Switch
                checked={form.is_recurring}
                onCheckedChange={(val) => setForm({ ...form, is_recurring: val })}
              />
              <Label className="cursor-pointer">Evento recorrente</Label>
            </div>

            {form.is_recurring && (
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <div>
                  <Label>Frequência</Label>
                  <Select
                    value={form.recurrence_type || ''}
                    onValueChange={(val) => setForm({ ...form, recurrence_type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Recorrência até</Label>
                  <Input
                    type="date"
                    value={form.recurrence_end_date || ''}
                    onChange={(e) => setForm({ ...form, recurrence_end_date: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.title || !form.event_date}>
                {editingEvent ? 'Salvar' : 'Criar Evento'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCalendarManager;
