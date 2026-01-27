import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Target, Percent } from 'lucide-react';

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

const MonthlyMetrics: React.FC = () => {
  const { user } = useAuth();

  // Get commercial tracking data
  const getTrackingData = (): WeekData[] => {
    if (!user) return [];
    const key = `commercial-tracking-${user.id}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  };

  const data = getTrackingData();
  
  // Calculate metrics
  const totalLeads = data.reduce((sum, w) => sum + (w.leadsGenerated || 0), 0);
  const totalClosed = data.reduce((sum, w) => sum + (w.closed || 0), 0);
  const totalRevenue = data.reduce((sum, w) => sum + (w.revenue || 0), 0);
  const conversionRate = totalLeads > 0 ? ((totalClosed / totalLeads) * 100).toFixed(1) : '0';
  const avgTicket = totalClosed > 0 ? totalRevenue / totalClosed : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const metrics = [
    { 
      label: 'Total Leads', 
      value: totalLeads.toString(), 
      icon: Users,
      color: 'text-blue-400'
    },
    { 
      label: 'Total Vendas', 
      value: totalClosed.toString(), 
      icon: Target,
      color: 'text-emerald-400'
    },
    { 
      label: 'Conv. Média', 
      value: `${conversionRate}%`, 
      icon: Percent,
      color: 'text-yellow-400'
    },
    { 
      label: 'Ticket Médio', 
      value: formatCurrency(avgTicket), 
      icon: DollarSign,
      color: 'text-purple-400'
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          Métricas do Mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
            >
              <div className="flex items-center gap-2">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
              <span className="font-semibold text-foreground">{metric.value}</span>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <p className="text-xs text-muted-foreground mt-4 text-center italic">
            Preencha o acompanhamento comercial para ver suas métricas.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyMetrics;
