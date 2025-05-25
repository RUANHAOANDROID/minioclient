import { ArrowDown, ArrowUp, Download, ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MinioObject } from '@/types/minio';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileTypeIcon } from './file-icon';
import { formatFileSize } from './file-size-formatter';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useLanguage } from '@/contexts/language-context';

interface FileTableViewProps {
  files: MinioObject[];
  onNavigate: (path: string) => void;
  onDownload: (file: MinioObject) => Promise<void>;
  onDelete: (file: MinioObject) => Promise<void>;
}

type SortField = 'name' | 'lastModified' | 'size' | 'type';
type SortDirection = 'asc' | 'desc';

export function FileTableView({ files, onNavigate, onDownload, onDelete }: FileTableViewProps) {
  const { t } = useLanguage();
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const getFileType = (file: MinioObject) => {
    if (file.isFolder) {
      return t('file.folder');
    }
    
    // 如果有后缀名，直接显示后缀名
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension) {
      return extension;
    }
    
    // 如果是已知的文件类型，直接显示
    const knownTypes = ['image', 'video', 'audio', 'document', 'archive', 'code'];
    if (knownTypes.includes(file.type)) {
      return file.type;
    }
    
    // 其他情况显示文件类型
    return file.type;
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    
    // Always put folders first
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    
    // Sort by the selected field
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'lastModified':
        comparison = a.lastModified.getTime() - b.lastModified.getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="w-full mt-4 rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">
              <Button 
                variant="ghost" 
                className="px-0 font-medium flex items-center gap-1"
                onClick={() => handleSort('name')}
              >
                {t('file.name')} <SortIcon field="name" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="px-0 font-medium flex items-center gap-1"
                onClick={() => handleSort('size')}
              >
                {t('file.size')} <SortIcon field="size" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="px-0 font-medium flex items-center gap-1"
                onClick={() => handleSort('type')}
              >
                {t('file.type')} <SortIcon field="type" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                className="px-0 font-medium flex items-center gap-1"
                onClick={() => handleSort('lastModified')}
              >
                {t('file.lastModified')} <SortIcon field="lastModified" />
              </Button>
            </TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFiles.map((file) => (
            <TableRow key={file.key} className={file.isFolder ? "hover:bg-muted/50" : "hover:bg-muted/30"}>
              <TableCell 
                className="font-medium py-3"
                onClick={() => file.isFolder && onNavigate(file.key)}
              >
                <div className="flex items-center gap-2 cursor-pointer">
                  <FileTypeIcon
                    type={file.type}
                    size={18}
                    className={file.isFolder ? "text-amber-500" : "text-primary/80"}
                  />
                  <span>{file.name}</span>
                </div>
              </TableCell>
              <TableCell>{file.isFolder ? '—' : formatFileSize(file.size)}</TableCell>
              <TableCell className="capitalize">{getFileType(file)}</TableCell>
              <TableCell>
                {format(file.lastModified, `${t('file.dateFormat')} ${t('file.timeFormat')}`)}
              </TableCell>
              <TableCell className="w-[60px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">{t('file.openMenu')}</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {file.isFolder ? (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onNavigate(file.key)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        <span>{t('file.open')}</span>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => onDownload(file)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          <span>{t('file.download')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => onDelete(file)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>{t('file.delete')}</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}