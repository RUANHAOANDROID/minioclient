import { FileType } from '@/types/minio';
import {
  FileText,
  Folder,
  Image,
  Video,
  Music,
  FileArchive,
  FileCode,
  File as FileIcon,
  type LucideIcon,
} from 'lucide-react';
import { ComponentProps } from 'react';

type FileIconProps = {
  type: FileType;
  size?: number;
} & ComponentProps<LucideIcon>;

const iconMap: Record<FileType, LucideIcon> = {
  document: FileText,
  image: Image,
  audio: Music,
  video: Video,
  archive: FileArchive,
  code: FileCode,
  pdf: FileText,
  folder: Folder,
  other: FileIcon,
};

export function FileTypeIcon({ type, size = 16, ...props }: FileIconProps) {
  const Icon = iconMap[type] || FileIcon;
  
  return <Icon size={size} {...props} />;
}