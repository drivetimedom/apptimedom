import React from 'react';
import { Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface SelectableItem {
  id: string;
  name: string;
  icon?: string;
}

interface StarMultiSelectProps {
  items: SelectableItem[];
  selectedIds: string[];
  featuredIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onFeaturedChange: (ids: string[]) => void;
  emptyMessage?: string;
}

const StarMultiSelect: React.FC<StarMultiSelectProps> = ({
  items,
  selectedIds,
  featuredIds,
  onSelectionChange,
  onFeaturedChange,
  emptyMessage = 'Nenhum item disponível',
}) => {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-1 max-h-48 overflow-y-auto border border-border rounded-lg p-2">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        const isFeatured = featuredIds.includes(item.id);

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                if (!checked) {
                  onFeaturedChange(featuredIds.filter((id) => id !== item.id));
                  onSelectionChange(selectedIds.filter((id) => id !== item.id));
                } else {
                  onSelectionChange([...selectedIds, item.id]);
                }
              }}
            />
            {item.icon && <span className="text-sm">{item.icon}</span>}
            <span className="flex-1 text-sm text-foreground truncate">{item.name}</span>
            {isSelected && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  onFeaturedChange(
                    isFeatured
                      ? featuredIds.filter((id) => id !== item.id)
                      : [...featuredIds, item.id]
                  );
                }}
              >
                <Star
                  className={`w-4 h-4 ${
                    isFeatured
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StarMultiSelect;
