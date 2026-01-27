import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, STORAGE_KEYS, getFromStorage, ActivationTask } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Get full user data from storage
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  const fullUser = users.find(u => u.id === user?.id);
  
  // Use custom activation plan if set by admin, otherwise use default
  const activationPlan: ActivationTask[] = (fullUser?.activationPlan && fullUser.activationPlan.length > 0)
    ? fullUser.activationPlan
    : defaultChecklist;

  // Load checked items from storage
  useEffect(() => {
    if (user) {
      const key = `activation-checklist-${user.id}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    }
  }, [user]);

  // Save to storage when changed
  const toggleItem = (itemId: string) => {
    const newChecked = {
      ...checkedItems,
      [itemId]: !checkedItems[itemId]
    };
    setCheckedItems(newChecked);
    
    if (user) {
      const key = `activation-checklist-${user.id}`;
      localStorage.setItem(key, JSON.stringify(newChecked));
    }
  };

  const completedCount = activationPlan.filter(item => checkedItems[item.id]).length;
  const totalCount = activationPlan.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
          <span className="text-sm text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activationPlan.map((item) => {
            const isChecked = checkedItems[item.id] || false;
            
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
                  "text-sm transition-all",
                  isChecked 
                    ? "text-muted-foreground line-through" 
                    : "text-foreground"
                )}>
                  {item.text}
                </span>
                {isChecked && (
                  <Sparkles className="w-3 h-3 text-accent ml-auto" />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4 italic">
          Os checklists são personalizados pelo seu mentor.
        </p>
      </CardContent>
    </Card>
  );
};

export default ActivationPlan;
