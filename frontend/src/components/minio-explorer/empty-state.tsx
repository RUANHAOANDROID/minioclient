import { FileIcon, FolderIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  isFiltered?: boolean;
  onClearFilter?: () => void;
}

export function EmptyState({ isFiltered = false, onClearFilter }: EmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center p-8 my-10">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileIcon size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No matching files found</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          We couldn't find any files or folders that match your search criteria.
        </p>
        {onClearFilter && (
          <Button variant="outline" onClick={onClearFilter}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 my-10">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FolderIcon size={24} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">This folder is empty</h3>
      <p className="text-muted-foreground text-center max-w-md">
        There are no files or folders in this location yet.
      </p>
    </div>
  );
}