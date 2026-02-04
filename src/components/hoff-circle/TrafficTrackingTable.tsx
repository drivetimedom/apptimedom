import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useTrafficTracking, 
  useCreateTrafficTracking, 
  useUpdateTrafficTracking, 
  useDeleteTrafficTracking 
} from '@/hooks/useTrafficTracking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  TrendingUp,
  Calendar,
  Users,
  CalendarCheck,
  CheckCircle,
  DollarSign,
  Loader2,
  Target,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';

const TrafficTrackingTable: React.FC = () => {
  const { user } = useAuth();
  const { data: weeks = [], isLoading } = useTrafficTracking();
  const createMutation = useCreateTrafficTracking();
  const updateMutation = useUpdateTrafficTracking();
  const deleteMutation = useDeleteTrafficTracking();
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const addNewWeek = () => {
    const today = new Date();
    const weekStart = format(today, 'yyyy-MM-dd');
    
    createMutation.mutate({
      week_start: weekStart,
      investment: 0,
      leads_generated: 0,
      appointments: 0,
      attendance: 0,
      deals: 0,
      average_ticket: 0,
      revenue: 0,
    });
  };

  const handleFieldChange = (weekId: string, field: string, value: string | number) => {
    updateMutation.mutate({ id: weekId, [field]: value });
  };

  const deleteWeek = (weekId: string) => {
    if (!confirm('Excluir este período?')) return;
    deleteMutation.mutate(weekId);
  };

  const calculateTotal = (field: 'investment' | 'leads_generated' | 'appointments' | 'attendance' | 'deals' | 'average_ticket' | 'revenue'): number => {
    return weeks.reduce((sum, week) => sum + (week[field] || 0), 0);
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

  const handleCurrencyChange = (weekId: string, field: string, value: string) => {
    const numericValue = parseCurrency(value);
    handleFieldChange(weekId, field, numericValue);
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-background px-4 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Acompanhamento do Tráfego
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Registre seus resultados de campanhas
          </p>
        </div>

        {/* Cards */}
        <div className="p-4 space-y-4">
          {weeks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum período registrado</p>
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
                      type="date"
                      value={week.week_start}
                      onChange={(e) => handleFieldChange(week.id, 'week_start', e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteWeek(week.id)}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> Investimento
                    </label>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(week.investment)}
                      onChange={(e) => handleCurrencyChange(week.id, 'investment', e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Leads Gerados
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={week.leads_generated}
                      onChange={(e) => handleFieldChange(week.id, 'leads_generated', parseInt(e.target.value) || 0)}
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
                      onChange={(e) => handleFieldChange(week.id, 'appointments', parseInt(e.target.value) || 0)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Comparecimentos
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={week.attendance}
                      onChange={(e) => handleFieldChange(week.id, 'attendance', parseInt(e.target.value) || 0)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Target className="w-3 h-3" /> Fechamentos
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={week.deals}
                      onChange={(e) => handleFieldChange(week.id, 'deals', parseInt(e.target.value) || 0)}
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Ticket Médio
                    </label>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(week.average_ticket)}
                      onChange={(e) => handleCurrencyChange(week.id, 'average_ticket', e.target.value)}
                      className="mt-1 h-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Faturamento
                  </label>
                  <Input
                    type="text"
                    placeholder="R$ 0,00"
                    value={formatCurrency(week.revenue)}
                    onChange={(e) => handleCurrencyChange(week.id, 'revenue', e.target.value)}
                    className="mt-1 h-9"
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
                  <span className="text-muted-foreground">Investimento:</span>
                  <span className="font-bold text-foreground">{formatCurrency(calculateTotal('investment'))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leads:</span>
                  <span className="font-bold text-foreground">{calculateTotal('leads_generated')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agendamentos:</span>
                  <span className="font-bold text-foreground">{calculateTotal('appointments')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comparecimentos:</span>
                  <span className="font-bold text-foreground">{calculateTotal('attendance')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fechamentos:</span>
                  <span className="font-bold text-foreground">{calculateTotal('deals')}</span>
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
          <Button onClick={addNewWeek} className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Novo Período
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
          <TrendingUp className="w-5 h-5 text-accent" />
          Acompanhamento do Tráfego
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Registre seus resultados de campanhas
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {weeks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Nenhum período registrado</p>
            <p className="text-sm">Clique no botão abaixo para começar a acompanhar seus resultados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="min-w-[140px]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Período
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <span className="flex items-center justify-center gap-1">
                    <Wallet className="w-4 h-4" /> Investimento
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  <span className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" /> Leads Gerados
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <span className="flex items-center justify-center gap-1">
                    <CalendarCheck className="w-4 h-4" /> Agendamentos
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[130px]">
                  <span className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Comparecimentos
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[100px]">
                  <span className="flex items-center justify-center gap-1">
                    <Target className="w-4 h-4" /> Fechamentos
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[120px]">
                  <span className="flex items-center justify-center gap-1">
                    <DollarSign className="w-4 h-4" /> Ticket Médio
                  </span>
                </TableHead>
                <TableHead className="text-center min-w-[130px]">
                  <span className="flex items-center justify-center gap-1">
                    <DollarSign className="w-4 h-4" /> Faturamento
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
                      type="date"
                      value={week.week_start}
                      onChange={(e) => handleFieldChange(week.id, 'week_start', e.target.value)}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(week.investment)}
                      onChange={(e) => handleCurrencyChange(week.id, 'investment', e.target.value)}
                      className="h-9 w-28 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={week.leads_generated}
                      onChange={(e) => handleFieldChange(week.id, 'leads_generated', parseInt(e.target.value) || 0)}
                      className="h-9 text-center w-20 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={week.appointments}
                      onChange={(e) => handleFieldChange(week.id, 'appointments', parseInt(e.target.value) || 0)}
                      className="h-9 text-center w-20 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={week.attendance}
                      onChange={(e) => handleFieldChange(week.id, 'attendance', parseInt(e.target.value) || 0)}
                      className="h-9 text-center w-20 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={week.deals}
                      onChange={(e) => handleFieldChange(week.id, 'deals', parseInt(e.target.value) || 0)}
                      className="h-9 text-center w-20 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(week.average_ticket)}
                      onChange={(e) => handleCurrencyChange(week.id, 'average_ticket', e.target.value)}
                      className="h-9 w-28 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={formatCurrency(week.revenue)}
                      onChange={(e) => handleCurrencyChange(week.id, 'revenue', e.target.value)}
                      className="h-9 w-28 mx-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWeek(week.id)}
                      disabled={deleteMutation.isPending}
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
                  {formatCurrency(calculateTotal('investment'))}
                </TableCell>
                <TableCell className="text-center font-bold text-foreground">
                  {calculateTotal('leads_generated')}
                </TableCell>
                <TableCell className="text-center font-bold text-foreground">
                  {calculateTotal('appointments')}
                </TableCell>
                <TableCell className="text-center font-bold text-foreground">
                  {calculateTotal('attendance')}
                </TableCell>
                <TableCell className="text-center font-bold text-foreground">
                  {calculateTotal('deals')}
                </TableCell>
                <TableCell className="text-center font-bold text-foreground">
                  -
                </TableCell>
                <TableCell className="text-center font-bold text-accent">
                  {formatCurrency(calculateTotal('revenue'))}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>

      {/* Add Button */}
      <div className="px-6 py-4 border-t border-border">
        <Button onClick={addNewWeek} disabled={createMutation.isPending}>
          {createMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Novo Período
        </Button>
      </div>
    </div>
  );
};

export default TrafficTrackingTable;
