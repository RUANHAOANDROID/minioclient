import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

type ViewMode = 'grid' | 'table';

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="flex">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'outline'}
        size="icon"
        className="rounded-r-none"
        onClick={() => onChange('grid')}
        aria-label="Grid view"
      >
        <Grid size={16} />
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'outline'}
        size="icon"
        className="rounded-l-none"
        onClick={() => onChange('table')}
        aria-label="Table view"
      >
        <List size={16} />
      </Button>
    </div>
  );
}