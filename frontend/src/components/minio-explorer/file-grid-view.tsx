import { MinioObject } from '@/types/minio';
import { FileTypeIcon } from './file-icon';
import { formatFileSize } from './file-size-formatter';
import { format } from 'date-fns';
import { Download, Trash2, ExternalLink, MoreHorizontal } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface FileGridViewProps {
  files: MinioObject[];
  onNavigate: (path: string) => void;
  onDownload: (file: MinioObject) => Promise<void>;
  onDelete: (file: MinioObject) => Promise<void>;
}

export function FileGridView({ files, onNavigate, onDownload, onDelete }: FileGridViewProps) {
  const { t } = useLanguage();

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {files.map((file) => (
        <div
          key={file.key}
          className="group relative flex flex-col items-center p-4 rounded-lg border hover:bg-muted/50 transition-colors"
          onClick={() => file.isFolder && onNavigate(file.key)}
        >
          <div className="relative w-16 h-16 mb-2">
            <FileTypeIcon
              type={file.type}
              size={64}
              className={file.isFolder ? "text-amber-500" : "text-primary/80"}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium truncate max-w-[150px]">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {file.isFolder ? t('file.folder') : formatFileSize(file.size)}
            </p>
            {!file.isFolder && (
              <>
                <p className="text-xs text-muted-foreground">
                  {getFileType(file)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(file.lastModified, `${t('file.dateFormat')} ${t('file.timeFormat')}`)}
                </p>
              </>
            )}
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          </div>
        </div>
      ))}
    </div>
  );
}