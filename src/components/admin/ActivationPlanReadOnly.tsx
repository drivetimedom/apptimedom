import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Circle, ClipboardList, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ActivationTask {
  id: string;
  text: string;
  done: boolean;
  fromTemplate?: string;
}

interface ActivationPlanReadOnlyProps {
  activationPlan: ActivationTask[];
  studentName: string;
  studentId: string;
}

const ActivationPlanReadOnly: React.FC<ActivationPlanReadOnlyProps> = ({
  activationPlan,
  studentName,
  studentId,
}) => {
  const navigate = useNavigate();
  
  const completedCount = activationPlan.filter(task => task.done).length;
  const totalCount = activationPlan.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (totalCount === 0) {
    return (
      <Card className="bg-card border-border h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-success" />
            Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Sem Implementação</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Este aluno ainda não tem tarefas prescritas
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Prescrever agora
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-success" />
            Implementação
          </CardTitle>
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            {completedCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="text-success font-semibold">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {/* Task List */}
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-2">
            {activationPlan.map((task, index) => (
              <div
                key={task.id || index}
                className={`
                  flex items-start gap-3 p-3 rounded-lg border transition-colors
                  ${task.done 
                    ? 'bg-success/5 border-success/20' 
                    : 'bg-muted/30 border-border'}
                `}
              >
                {/* Checkbox Visual */}
                <div className="flex-shrink-0 mt-0.5">
                  {task.done ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {task.text}
                  </p>
                  
                  {/* Task Origin */}
                  {task.fromTemplate && (
                    <Badge 
                      variant="secondary" 
                      className="mt-1 text-xs bg-muted text-muted-foreground"
                    >
                      📋 {task.fromTemplate}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Info Tip */}
        <div className="flex items-start gap-2 p-3 bg-info/10 border border-info/20 rounded-lg">
          <Info className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Para editar a Implementação, vá em{' '}
            <span className="text-foreground font-medium">Usuários → Editar → Prescrição</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivationPlanReadOnly;
