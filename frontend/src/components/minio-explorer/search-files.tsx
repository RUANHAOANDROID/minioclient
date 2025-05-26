import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface SearchFilesProps {
  onSearch: (term: string) => void;
}

export function SearchFiles({ onSearch }: SearchFilesProps) {
  const { t } = useLanguage();

  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={t('file.search')}
        className="pl-8"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}