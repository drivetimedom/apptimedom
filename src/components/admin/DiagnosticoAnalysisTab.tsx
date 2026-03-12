import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, ArrowUpDown, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ExcelJS from 'exceljs';

interface Profile {
  user_id: string;
  name: string;
  email: string | null;
  status: string | null;
}

interface Diagnostico {
  id: string;
  user_id: string;
  respostas: any;
  resultado_ia: any;
  resultado_final: any;
  mapa_prescrito_final: string | null;
  status: string;
  created_at: string;
}

interface Props {
  diagnosticos: Diagnostico[];
  profiles: Profile[];
  isLoading: boolean;
}

const QUESTION_LABELS: Record<string, string> = {
  faturamento: 'Faturamento (R$)',
  ticket_medio: 'Ticket Médio (R$)',
  atendimentos: 'Pico Faturamento (R$)',
  estrutura: 'Estrutura',
  posicionamento: 'Posicionamento',
  origem_pacientes: 'Origem Pacientes',
  dificuldade: 'Dificuldade',
  comercial: 'Comercial',
  objetivo: 'Objetivo 6 meses (R$)',
};

const DiagnosticoAnalysisTab: React.FC<Props> = ({ diagnosticos, profiles, isLoading }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const getProfile = (userId: string) => profiles.find(p => p.user_id === userId);

  const tableData = useMemo(() => {
    return diagnosticos.map(d => {
      const profile = getProfile(d.user_id);
      const respostas = d.respostas || {};
      return {
        id: d.id,
        name: profile?.name || 'Sem nome',
        email: profile?.email || '',
        date: new Date(d.created_at).toLocaleDateString('pt-BR'),
        status: d.status,
        mapa: d.mapa_prescrito_final || d.resultado_ia?.mapa_prescrito || '-',
        ...Object.fromEntries(
          Object.keys(QUESTION_LABELS).map(key => [key, respostas[key] ?? '-'])
        ),
      };
    });
  }, [diagnosticos, profiles]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return tableData;
    const q = searchQuery.toLowerCase();
    return tableData.filter(row =>
      row.name.toLowerCase().includes(q) ||
      (row.email && row.email.toLowerCase().includes(q))
    );
  }, [tableData, searchQuery]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as any)[sortColumn] ?? '';
      const bVal = (b as any)[sortColumn] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), 'pt-BR', { numeric: true });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'date', label: 'Data' },
    { key: 'status', label: 'Status' },
    { key: 'mapa', label: 'Mapa Prescrito' },
    ...Object.entries(QUESTION_LABELS).map(([key, label]) => ({ key, label })),
  ];

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Diagnósticos');

      worksheet.columns = columns.map(col => ({
        header: col.label,
        key: col.key,
        width: 20,
      }));

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      sortedData.forEach(row => {
        const rowData: Record<string, string> = {};
        columns.forEach(col => rowData[col.key] = String((row as any)[col.key] ?? '-'));
        worksheet.addRow(rowData);
      });

      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, cell => {
          const len = cell.value ? String(cell.value).length : 10;
          if (len > maxLength) maxLength = len;
        });
        column.width = Math.min(Math.max(maxLength + 2, 15), 50);
      });

      worksheet.eachRow({ includeEmpty: false }, row => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diagnosticos-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: '✅ Arquivo exportado com sucesso!' });
    } catch (err) {
      console.error('Export error:', err);
      toast({ title: 'Erro ao exportar', variant: 'destructive' });
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pendente: { label: '⏳ Pendente', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
      aprovado: { label: '✅ Aprovado', className: 'bg-green-500/10 text-green-500 border-green-500/30' },
      ajustado: { label: '✏️ Ajustado', className: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
      reprovado: { label: '❌ Reprovado', className: 'bg-red-500/10 text-red-500 border-red-500/30' },
    };
    const s = map[status] || { label: status, className: '' };
    return <Badge variant="outline" className={s.className}>{s.label}</Badge>;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar XLSX
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">{filteredData.length} respostas encontradas</p>

      <div className="border border-border rounded-lg overflow-auto max-h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer whitespace-nowrap select-none hover:bg-muted/50"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortColumn === col.key && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map(row => (
                <TableRow key={row.id}>
                  {columns.map(col => (
                    <TableCell key={col.key} className="whitespace-nowrap">
                      {col.key === 'status' ? statusBadge(row.status) : String((row as any)[col.key] ?? '-')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  Nenhuma resposta encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DiagnosticoAnalysisTab;
