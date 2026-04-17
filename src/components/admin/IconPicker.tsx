import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles, Search, Check, type LucideIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Curated list of icons relevant to AI tools, marketing, clinic, productivity.
const ICON_OPTIONS = [
  'Sparkles', 'Wand2', 'Bot', 'Brain', 'Zap', 'Rocket', 'Target', 'TrendingUp',
  'BarChart3', 'PieChart', 'LineChart', 'Activity', 'Calculator', 'Calendar',
  'Clock', 'Megaphone', 'Send', 'MessageSquare', 'Mail', 'Phone', 'Users',
  'User', 'UserPlus', 'Heart', 'Star', 'Award', 'Trophy', 'Crown', 'Gem',
  'Diamond', 'Flame', 'Lightbulb', 'Compass', 'Map', 'MapPin', 'Globe',
  'Search', 'Filter', 'Layers', 'Grid3x3', 'LayoutGrid', 'PenTool', 'Pencil',
  'Edit', 'FileText', 'FileSearch', 'Folder', 'FolderOpen', 'Image', 'Video',
  'Camera', 'Mic', 'Music', 'PlayCircle', 'Headphones', 'Briefcase', 'ShoppingBag',
  'ShoppingCart', 'CreditCard', 'DollarSign', 'Wallet', 'Coins', 'Banknote',
  'Stethoscope', 'HeartPulse', 'Pill', 'Syringe', 'Building2', 'Home',
  'Settings', 'Wrench', 'Hammer', 'Cog', 'Cpu', 'Database', 'Cloud', 'Code',
  'Terminal', 'BookOpen', 'GraduationCap', 'School', 'Library', 'Bookmark',
  'CheckCircle2', 'Shield', 'Lock', 'Key', 'Eye', 'Bell', 'Gift', 'Package',
  'Truck', 'Plane', 'Share2', 'Link', 'ExternalLink', 'Download', 'Upload',
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const SelectedIcon =
    ((LucideIcons as unknown as Record<string, LucideIcon>)[value]) || Sparkles;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_OPTIONS;
    return ICON_OPTIONS.filter((n) => n.toLowerCase().includes(q));
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          className="w-full justify-start gap-2 font-normal"
        >
          <SelectedIcon className="w-4 h-4" />
          <span className="text-sm">{value || 'Selecionar ícone'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar ícone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-6 gap-1 p-3">
            {filtered.map((name) => {
              const Icon =
                (LucideIcons as unknown as Record<string, LucideIcon>)[name];
              if (!Icon) return null;
              const isSelected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={cn(
                    'relative aspect-square flex items-center justify-center rounded-md border border-transparent hover:border-border hover:bg-accent transition-colors',
                    isSelected && 'border-primary bg-accent'
                  )}
                >
                  <Icon className="w-4 h-4 text-foreground" />
                  {isSelected && (
                    <Check className="w-3 h-3 absolute top-0.5 right-0.5 text-primary" />
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-6 text-center text-xs text-muted-foreground py-6">
                Nenhum ícone encontrado
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;
