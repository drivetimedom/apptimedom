import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, STORAGE_KEYS, getFromStorage, setToStorage, ActivationTask } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Sparkles, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Default checklist for users without custom activation plan
const defaultChecklist: ActivationTask[] = [
  { id: 'item-1', text: 'Criar conta Business Manager', done: false },
  { id: 'item-2', text: 'Conectar Instagram', done: false },
  { id: 'item-3', text: 'Conectar WhatsApp Business', done: false },
  { id: 'item-4', text: 'Rodar 1ª campanha', done: false },
  { id: 'item-5', text: 'Investir R$ 500 em tráfego', done: false },
  { id: 'item-6', text: 'Gerar 30 leads', done: false },
  { id: 'item-7', text: 'Fazer 5 vendas', done: false },
  { id: 'item-8', text: 'Atingir R$ 2.000 de faturamento', done: false },
];

const ActivationPlan: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activationPlan, setActivationPlan] = useState<ActivationTask[]>([]);

  // Load user's activation plan from storage
  useEffect(() => {
    if (user) {
      const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
      const fullUser = users.find(u => u.id === user.id);
      
      if (fullUser?.activationPlan && fullUser.activationPlan.length > 0) {
        setActivationPlan(fullUser.activationPlan);
      } else {
        setActivationPlan(defaultChecklist);
      }
    }
  }, [user]);

  const toggleItem = (taskId: string) => {
    if (!user) return;
    
    const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex === -1) return;
    
    const updatedPlan = activationPlan.map(task =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    
    // Update local state
    setActivationPlan(updatedPlan);
    
    // Update storage
    users[userIndex] = {
      ...users[userIndex],
      activationPlan: updatedPlan,
    };
    setToStorage(STORAGE_KEYS.USERS, users);
    
    // Show toast when task is completed
    const task = updatedPlan.find(t => t.id === taskId);
    if (task?.done) {
      toast({ title: 'Tarefa concluída! 🎉' });
    }
  };

  const completedCount = activationPlan.filter(item => item.done).length;
  const totalCount = activationPlan.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allCompleted = completedCount === totalCount && totalCount > 0;

  // Group tasks by template origin
  const groupedTasks = activationPlan.reduce((acc, task) => {
    const key = task.fromTemplate || 'individual';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {} as Record<string, ActivationTask[]>);

  // Sort groups: templates first, individual last
  const sortedGroups = Object.entries(groupedTasks).sort(([a], [b]) => {
    if (a === 'individual') return 1;
    if (b === 'individual') return -1;
    return a.localeCompare(b);
  });

  if (activationPlan.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <CheckSquare className="w-5 h-5 text-accent" />
            </div>
            Plano de Ativação
          </CardTitle>
          <div className="flex items-center gap-2">
            {allCompleted && (
              <Trophy className="w-5 h-5 text-warning animate-pulse" />
            )}
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                allCompleted 
                  ? "bg-gradient-to-r from-warning to-warning/80" 
                  : "bg-gradient-to-r from-accent to-accent/80"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {allCompleted && (
            <p className="text-xs text-warning font-medium mt-2 text-center animate-pulse">
              🎉 Parabéns! Você completou todas as tarefas!
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedGroups.map(([groupKey, tasks]) => (
            <div key={groupKey}>
              {/* Show group label only if there are multiple groups or it's from a template */}
              {sortedGroups.length > 1 && (
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  {groupKey === 'individual' ? '📌 Tarefas Personalizadas' : `📋 ${groupKey}`}
                </p>
              )}
              <div className="space-y-2">
                {tasks.map((item) => {
                  const isChecked = item.done;
                  
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer hover:bg-muted/50",
                        isChecked && "bg-accent/10"
                      )}
                      onClick={() => toggleItem(item.id)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                      />
                      <span className={cn(
                        "text-sm transition-all flex-1",
                        isChecked 
                          ? "text-muted-foreground line-through" 
                          : "text-foreground"
                      )}>
                        {item.text}
                      </span>
                      {isChecked && (
                        <Sparkles className="w-3 h-3 text-accent" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 italic">
          Os checklists são personalizados pelo seu mentor. As tarefas que você marca como concluídas são salvas automaticamente.
        </p>
      </CardContent>
    </Card>
  );
};

export default ActivationPlan;
