import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Search, 
  Download, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Percent,
  Calendar,
  BarChart3,
  User as UserIcon,
  ClipboardList,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import ActivationPlanReadOnly from './ActivationPlanReadOnly';
import { useAllCommercialTracking, CommercialTrackingWeek } from '@/hooks/useCommercialTracking';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ActivationTask {
  id: string;
  text: string;
  done: boolean;
  fromTemplate?: string;
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  instagram: string | null;
  status: string | null;
  activation_plan: ActivationTask[] | null;
}

interface StudentWithTracking {
  id: string;
  user_id: string;
  name: string;
  email: string;
  tracking: CommercialTrackingWeek[];
  totals: {
    leads: number;
    appointments: number;
    attendance: number;
    deals: number;
    revenue: number;
  };
  hasData: boolean;
  activationPlan: ActivationTask[];
}

// Hook to fetch all profiles with their auth emails
function useProfiles() {
  return useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Map to our Profile interface
      return (data || []).map(row => ({
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        avatar: row.avatar,
        bio: row.bio,
        instagram: row.instagram,
        status: row.status,
        activation_plan: Array.isArray(row.activation_plan) ? row.activation_plan as unknown as ActivationTask[] : []
      })) as Profile[];
    },
  });
}

const AdminCommercialTracking: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Fetch all profiles and tracking data
  const { data: profiles = [], isLoading: loadingProfiles } = useProfiles();
  const { data: allTracking = [], isLoading: loadingTracking } = useAllCommercialTracking();

  // Build students with tracking data
  const studentsWithTracking = useMemo((): StudentWithTracking[] => {
    return profiles.map(profile => {
      const tracking = allTracking.filter(t => t.user_id === profile.user_id);
      const totals = calculateTotals(tracking);
      const activationPlan = (profile.activation_plan || []) as ActivationTask[];
      
      return {
        id: profile.id,
        user_id: profile.user_id,
        name: profile.name,
        email: profile.user_id, // We'll display user_id since we can't access auth.users
        tracking,
        totals,
        hasData: tracking.length > 0,
        activationPlan
      };
    });
  }, [profiles, allTracking]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return studentsWithTracking.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterStatus === 'all' || 
        (filterStatus === 'active' && student.hasData) ||
        (filterStatus === 'inactive' && !student.hasData);
      
      return matchesSearch && matchesFilter;
    });
  }, [studentsWithTracking, searchTerm, filterStatus]);

  // Selected student
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return filteredStudents[0] || null;
    return studentsWithTracking.find(s => s.id === selectedStudentId) || null;
  }, [selectedStudentId, studentsWithTracking, filteredStudents]);

  // Helper functions
  function calculateTotals(tracking: CommercialTrackingWeek[]) {
    return tracking.reduce((acc, week) => ({
      leads: acc.leads + (week.leads || 0),
      appointments: acc.appointments + (week.appointments || 0),
      attendance: acc.attendance + (week.attendance || 0),
      deals: acc.deals + (week.deals || 0),
      revenue: acc.revenue + (Number(week.revenue) || 0)
    }), {
      leads: 0,
      appointments: 0,
      attendance: 0,
      deals: 0,
      revenue: 0
    });
  }

  function calculateRate(numerator: number, denominator: number): string {
    if (denominator === 0) return '0';
    return ((numerator / denominator) * 100).toFixed(1);
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  function getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  // Export function
  function exportStudentData(student: StudentWithTracking) {
    if (!student.hasData) {
      toast({ title: 'Este aluno não possui dados para exportar', variant: 'destructive' });
      return;
    }

    // Sheet 1: Weekly data
    const ws1 = XLSX.utils.json_to_sheet(
      student.tracking.map(week => ({
        'Semana': formatDate(week.week_start),
        'Leads': week.leads,
        'Agendamentos': week.appointments,
        'Comparecimento': week.attendance,
        'Fechamentos': week.deals,
        'Faturamento': Number(week.revenue),
        'Observações': week.observations || ''
      }))
    );

    // Sheet 2: Summary
    const ws2 = XLSX.utils.aoa_to_sheet([
      [`RESUMO - ${student.name}`],
      [''],
      ['TOTAIS'],
      ['Total de Leads', student.totals.leads],
      ['Total de Agendamentos', student.totals.appointments],
      ['Total Comparecimento', student.totals.attendance],
      ['Total Fechamentos', student.totals.deals],
      ['Faturamento Total', student.totals.revenue],
      [''],
      ['TAXAS'],
      ['Taxa de Agendamento', `${calculateRate(student.totals.appointments, student.totals.leads)}%`],
      ['Taxa de Comparecimento', `${calculateRate(student.totals.attendance, student.totals.appointments)}%`],
      ['Taxa de Conversão', `${calculateRate(student.totals.deals, student.totals.attendance)}%`],
      ['Ticket Médio', student.totals.deals > 0 ? (student.totals.revenue / student.totals.deals).toFixed(2) : '0']
    ]);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Acompanhamento Semanal');
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumo e Métricas');

    // Save
    const fileName = `acompanhamento-${student.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({ title: 'Excel exportado com sucesso!' });
  }

  // Global stats
  const globalStats = useMemo(() => {
    const totals = studentsWithTracking.reduce((acc, student) => ({
      leads: acc.leads + student.totals.leads,
      appointments: acc.appointments + student.totals.appointments,
      attendance: acc.attendance + student.totals.attendance,
      deals: acc.deals + student.totals.deals,
      revenue: acc.revenue + student.totals.revenue
    }), { leads: 0, appointments: 0, attendance: 0, deals: 0, revenue: 0 });

    return {
      ...totals,
      studentsWithData: studentsWithTracking.filter(s => s.hasData).length,
      totalStudents: studentsWithTracking.length
    };
  }, [studentsWithTracking]);

  const isLoading = loadingProfiles || loadingTracking;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alunos Ativos</p>
                <p className="text-2xl font-bold text-foreground">
                  {globalStats.studentsWithData}/{globalStats.totalStudents}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold text-foreground">{globalStats.leads}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendas</p>
                <p className="text-2xl font-bold text-foreground">{globalStats.deals}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conv. Geral</p>
                <p className="text-2xl font-bold text-foreground">
                  {calculateRate(globalStats.deals, globalStats.leads)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(globalStats.revenue)}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List - Left Sidebar */}
        <Card className="lg:col-span-1 bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lista de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os alunos</SelectItem>
                <SelectItem value="active">Com dados</SelectItem>
                <SelectItem value="inactive">Sem dados</SelectItem>
              </SelectContent>
            </Select>

            {/* Student Cards */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pr-4">
                {filteredStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum aluno encontrado
                  </p>
                ) : (
                  filteredStudents.map(student => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`
                        p-4 rounded-lg cursor-pointer transition-all
                        ${selectedStudent?.id === student.id 
                          ? 'bg-accent border-l-4 border-l-primary' 
                          : 'bg-muted/30 hover:bg-muted/50 border-l-4 border-l-transparent'}
                      `}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                          {getInitials(student.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{student.name}</h3>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Semanas:</span>
                          <span className="text-foreground font-semibold">{student.tracking.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-success" />
                          <span className="text-success font-semibold">{formatCurrency(student.totals.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Student Details - Right Panel */}
        <Card className="lg:col-span-2 bg-card border-border">
          {selectedStudent ? (
            <>
              {/* Student Header */}
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                      {getInitials(selectedStudent.name)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{selectedStudent.name}</h2>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => exportStudentData(selectedStudent)}
                    variant="outline"
                    className="gap-2"
                    disabled={!selectedStudent.hasData}
                  >
                    <Download className="w-4 h-4" />
                    Exportar Excel
                  </Button>
                </div>

                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Badge variant={selectedStudent.hasData ? 'default' : 'secondary'}>
                    {selectedStudent.hasData ? `${selectedStudent.tracking.length} semanas` : 'Sem dados comerciais'}
                  </Badge>
                  <Badge variant="outline">
                    {formatCurrency(selectedStudent.totals.revenue)} total
                  </Badge>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    <ClipboardList className="w-3 h-3 mr-1" />
                    {selectedStudent.activationPlan.filter(t => t.done).length}/{selectedStudent.activationPlan.length} tarefas
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {/* Stacked Layout - Commercial on top, Activation below */}
                <div className="space-y-6">
                  {/* Commercial Tracking Section */}
                  {selectedStudent.hasData ? (
                    <>
                      {/* Tracking Table */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Histórico de Acompanhamento
                        </h3>
                        
                        <div className="rounded-lg border border-border overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead>Semana</TableHead>
                                  <TableHead className="text-center">Leads</TableHead>
                                  <TableHead className="text-center">Agend.</TableHead>
                                  <TableHead className="text-center">Compar.</TableHead>
                                  <TableHead className="text-center">Fecham.</TableHead>
                                  <TableHead className="text-right">Faturamento</TableHead>
                                  <TableHead>Obs.</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedStudent.tracking.map(week => (
                                  <TableRow key={week.id}>
                                    <TableCell className="font-medium">{formatDate(week.week_start)}</TableCell>
                                    <TableCell className="text-center">{week.leads}</TableCell>
                                    <TableCell className="text-center">{week.appointments}</TableCell>
                                    <TableCell className="text-center">{week.attendance}</TableCell>
                                    <TableCell className="text-center">{week.deals}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(Number(week.revenue))}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-[120px] truncate">
                                      {week.observations || '-'}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                              <TableFooter className="bg-primary/5 border-t-2 border-primary">
                                <TableRow>
                                  <TableCell className="font-semibold">TOTAIS</TableCell>
                                  <TableCell className="text-center font-bold">{selectedStudent.totals.leads}</TableCell>
                                  <TableCell className="text-center font-bold">{selectedStudent.totals.appointments}</TableCell>
                                  <TableCell className="text-center font-bold">{selectedStudent.totals.attendance}</TableCell>
                                  <TableCell className="text-center font-bold">{selectedStudent.totals.deals}</TableCell>
                                  <TableCell className="text-right font-bold text-success">
                                    {formatCurrency(selectedStudent.totals.revenue)}
                                  </TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableFooter>
                            </Table>
                          </div>
                        </div>
                      </div>

                      {/* Metrics Cards */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Métricas e Performance
                        </h3>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card className="bg-muted/30 border-border">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Taxa de Agendamento</p>
                              <p className="text-2xl font-bold text-foreground">
                                {calculateRate(selectedStudent.totals.appointments, selectedStudent.totals.leads)}%
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedStudent.totals.appointments} de {selectedStudent.totals.leads} leads
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/30 border-border">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Taxa de Comparecimento</p>
                              <p className="text-2xl font-bold text-foreground">
                                {calculateRate(selectedStudent.totals.attendance, selectedStudent.totals.appointments)}%
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedStudent.totals.attendance} de {selectedStudent.totals.appointments} agendados
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/30 border-border">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Taxa de Conversão</p>
                              <p className="text-2xl font-bold text-success">
                                {calculateRate(selectedStudent.totals.deals, selectedStudent.totals.attendance)}%
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedStudent.totals.deals} de {selectedStudent.totals.attendance} atendidos
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="bg-muted/30 border-border">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Ticket Médio</p>
                              <p className="text-2xl font-bold text-foreground">
                                {selectedStudent.totals.deals > 0 
                                  ? formatCurrency(selectedStudent.totals.revenue / selectedStudent.totals.deals)
                                  : 'R$ 0'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {selectedStudent.totals.deals} vendas
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <BarChart3 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Sem dados de acompanhamento</h3>
                      <p className="text-muted-foreground max-w-md">
                        Este aluno ainda não preencheu nenhuma semana de acompanhamento comercial.
                      </p>
                    </div>
                  )}
                  
                  {/* Activation Plan - Below Commercial Data */}
                  <ActivationPlanReadOnly
                    activationPlan={selectedStudent.activationPlan}
                    studentName={selectedStudent.name}
                    studentId={selectedStudent.user_id}
                  />
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Selecione um aluno</h3>
              <p className="text-muted-foreground">
                Escolha um aluno na lista para ver os dados de acompanhamento comercial.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminCommercialTracking;
