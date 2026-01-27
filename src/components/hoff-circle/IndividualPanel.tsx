import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Star, TrendingUp } from 'lucide-react';

type UserLevel = 'iniciante' | 'intermediario' | 'avancado' | 'expert';

const levelConfig: Record<UserLevel, { label: string; color: string; icon: React.ReactNode }> = {
  iniciante: { 
    label: 'INICIANTE', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: <Star className="w-4 h-4" />
  },
  intermediario: { 
    label: 'INTERMEDIÁRIO', 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: <TrendingUp className="w-4 h-4" />
  },
  avancado: { 
    label: 'AVANÇADO', 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: <TrendingUp className="w-4 h-4" />
  },
  expert: { 
    label: 'EXPERT', 
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: <Star className="w-4 h-4" />
  },
};

const IndividualPanel: React.FC = () => {
  const { user } = useAuth();
  
  // TODO: Get actual user level from progress/storage
  const userLevel: UserLevel = 'intermediario';
  const config = levelConfig[userLevel];
  
  const firstName = user?.name?.split(' ')[0] || 'Aluno';

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          Painel Individual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Welcome message */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-border">
              <span className="text-xl font-bold text-foreground">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Bem-vindo(a), {firstName}! 👋
              </p>
              <p className="text-sm text-muted-foreground">
                Continue sua jornada de crescimento
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge className={`${config.color} border flex items-center gap-1`}>
              {config.icon}
              {config.label}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IndividualPanel;
