import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getFromStorage, setToStorage, generateId } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { 
  Plus, 
  Trash2, 
  BarChart3,
  Calendar,
  Users,
  CalendarCheck,
  CheckCircle,
  DollarSign,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface WeekData {
  id: string;
  period: string;
  leadsGenerated: number;
  appointments: number;
  attended: number;
  closed: number;
  revenue: number;
  observations: string;
  createdAt: string;
}

const CommercialTrackingTable: React.FC = () => {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) {
      const data = getFromStorage<WeekData[]>(`commercial-tracking-${user.id}`, []);
      setWeeks(data);
    }
  }, [user]);

  const saveData = (newWeeks: WeekData[]) => {
    if (user) {
      setToStorage(`commercial-tracking-${user.id}`, newWeeks);
      setWeeks(newWeeks);
    }
  };

  const addNewWeek = () => {
    const newWeek: WeekData = {
      id: generateId(),
      period: '',
      leadsGenerated: 0,
      appointments: 0,
      attended: 0,
      closed: 0,
      revenue: 0,
      observations: '',
      createdAt: new Date().toISOString(),
    };
    const newWeeks = [...weeks, newWeek];
    saveData(newWeeks);
    toast.success('Nova semana adicionada!');
  };

  const updateWeek = (weekId: string, field: keyof WeekData, value: string | number) => {
    const newWeeks = weeks.map(week => 
      week.id === weekId ? { ...week, [field]: value } : week
    );
    saveData(newWeeks);
  };

  const deleteWeek = (weekId: string) => {
    if (!confirm('Excluir esta semana?')) return;
    const newWeeks = weeks.filter(w => w.id !== weekId);
    saveData(newWeeks);
    toast.success('Semana excluída!');
  };

  const calculateTotal = (field: keyof WeekData): number => {
    return weeks.reduce((sum, week) => {
      const value = week[field];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const parseCurrency = (value: string): number => {
    const cleaned = value.replace(/[R$.\s]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const handleRevenueChange = (weekId: string, value: string) => {
    // Remove non-numeric except comma and dot
    const numericValue = parseCurrency(value);
    updateWeek(weekId, 'revenue', numericValue);
  };

  if (!user) return null;

  // Mobile card view
  if (isMobile) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-background px-4 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Acompanhamento Comercial
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Registre seus resultados semanais
          </p>
        </div>

        {/* Cards */}
        <div className="p-4 space-y-4">
          {weeks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma semana registrada</p>
              <p className="text-sm">Clique no botão abaixo para adicionar</p>
            </div>
          ) : (
            weeks.map((week) => (
              <div 
                key={week.id} 
                className="bg-background border border-border rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Período
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: 1/08 a 8/08"
                      value={week.period}
                      onChange={(e) => updateWeek(week.id, 'period', e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteWeek(week.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Leads
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={week.leadsGenerated}
                      onChange={(e) => updateWeek(week.id, 'leadsGenerated', parseInt(e.target.value) || 0)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" /> Agendamentos
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={week.appointments}
                      onChange={(e) => updateWeek(week.id, 'appointments', parseInt(e.target.value) || 0)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Compareceu
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={week.attended}
                      onChange={(e) => updateWeek(week.id, 'attended', parseInt(e.target.value) || 0)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Fechamento
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={week.closed}
                      onChange={(e) => updateWeek(week.id, 'closed', parseInt(e.target.value) || 0)}
                      className="mt-1 h-9"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Faturamento
                  </label>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={formatCurrency(week.revenue)}
                    onChange={(e) => handleRevenueChange(week.id, e.target.value)}
                    className="mt-1 h-9"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Observações
                  </label>
                  <Textarea
                    value={week.observations}
                    onChange={(e) => updateWeek(week.id, 'observations', e.target.value)}
                    placeholder="Anotações, ações extras..."
                    rows={2}
                    className="mt-1 resize-none"
                  />
                </div>
              </div>
            ))
          )}

          {/* Totals Card */}
          {weeks.length > 0 && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-accent mb-3">📊 TOTAIS</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leads:</span>
                  <span className="font-bold text-foreground">{calculateTotal('leadsGenerated')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agendamentos:</span>
                  <span className="font-bold text-foreground">{calculateTotal('appointments')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compareceu:</span>
                  <span className="font-bold text-foreground">{calculateTotal('attended')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fechamento:</span>
                  <span className="font-bold text-foreground">{calculateTotal('closed')}</span>
                </div>
                <div className="col-span-2 flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Faturamento Total:</span>
                  <span className="font-bold text-accent">{formatCurrency(calculateTotal('revenue'))}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Button */}
        <div className="px-4 py-4 border-t border-border">
          <Button onClick={addNewWeek} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Nova Semana
          </Button>
        </div>
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-background px-6 py-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Acompanhamento Comercial
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Registre seus resultados semanais
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {weeks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhuma semana registrada</p>
            <p className="text-sm">Clique no botão abaixo para começar a acompanhar seus resultados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="min-w-[140px]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Semana/Período
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  <span className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" /> Leads
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <span className="flex items-center justify-center gap-1">
                    <CalendarCheck className="w-4 h-4" /> Agendamentos
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <span className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Compareceu
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  <span className="flex items-center justify-center gap-1">
                    <DollarSign className="w-4 h-4" /> Fechamento
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[130px]">
                  <span className="flex items-center justify-center gap-1">
                    <DollarSign className="w-4 h-4" /> Faturamento
                  </span>
                </TableHead>
                <TableHead className="min-w-[200px]">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> Observações/Ação Extra
                  </span>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.map((week) => (
                <TableRow key={week.id} className="hover:bg-muted/20">
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="Ex: 1/08 a 8/08"
                      value={week.period}
                      onChange={(e) => updateWeek(week.id, 'period', e.target.value)}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={week.leadsGenerated}
                      onChange={(e) => updateWeek(week.id, 'leadsGenerated', parseInt(e.target.value) || 0)}
                      className="h-9 text-center w-20 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={week.appointments}
                      onChange={(e) => updateWeek(week.id, 'appointments', parseInt(e.target.value) || 0)}
                      className="h-9 text-center w-20 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={week.attended}
                      onChange={(e) => updateWeek(week.id, 'attended', parseInt(e.target.value) || 0)}
                      className="h-9 text-center w-20 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={week.closed}
                      onChange={(e) => updateWeek(week.id, 'closed', parseInt(e.target.value) || 0)}
                      className="h-9 text-center w-20 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(week.revenue)}
                      onChange={(e) => handleRevenueChange(week.id, e.target.value)}
                      className="h-9 w-28 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      value={week.observations}
                      onChange={(e) => updateWeek(week.id, 'observations', e.target.value)}
                      placeholder="Anotações..."
                      rows={1}
                      className="resize-none min-h-[36px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWeek(week.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-accent/10 border-t-2 border-accent">
              <TableRow className="hover:bg-accent/10">
                <TableCell className="font-semibold text-muted-foreground">TOTAIS:</TableCell>
                <TableCell className="text-center font-bold text-foreground">
                  {calculateTotal('leadsGenerated')}
                </TableCell>
                <TableCell className="text-center font-bold text-foreground">
                  {calculateTotal('appointments')}
                </TableCell>
                <TableCell className="text-center font-bold text-foreground">
                  {calculateTotal('attended')}
                </TableCell>
                <TableCell className="text-center font-bold text-foreground">
                  {calculateTotal('closed')}
                </TableCell>
                <TableCell className="text-center font-bold text-accent">
                  {formatCurrency(calculateTotal('revenue'))}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>

      {/* Add Button */}
      <div className="px-6 py-4 border-t border-border">
        <Button onClick={addNewWeek}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Semana
        </Button>
      </div>
    </div>
  );
};

export default CommercialTrackingTable;
