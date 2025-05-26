import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MinioPath } from '@/types/minio';

interface BreadcrumbNavigationProps {
  paths: MinioPath[];
  onNavigate: (path: string) => void;
  bucket: string;
}

export function BreadcrumbNavigation({ 
  paths, 
  onNavigate, 
  bucket 
}: BreadcrumbNavigationProps) {
  return (
    <div className="flex items-center gap-1 text-sm overflow-x-auto pb-2 max-w-full">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={() => onNavigate('')}
      >
        <Home size={16} className="mr-1" />
        <span className="font-medium">{bucket}</span>
      </Button>
      
      {paths.length > 0 && <ChevronRight size={16} className="text-muted-foreground" />}
      
      {paths.map((path, index) => (
        <div key={path.path} className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => onNavigate(path.path)}
          >
            <span className="font-medium truncate max-w-[150px]">{path.name}</span>
          </Button>
          
          {index < paths.length - 1 && (
            <ChevronRight size={16} className="text-muted-foreground ml-1" />
          )}
        </div>
      ))}
    </div>
  );
}