import {FileType} from '@/types/minio';
import {
    File as FileIcon,
    FileArchive,
    FileCode,
    FileText,
    Folder,
    Image,
    type LucideIcon,
    Music,
    Video,
    Smartphone,
    Monitor,
} from 'lucide-react';
import {ComponentProps} from 'react';

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
    apk: Smartphone,
    exe: Monitor,
    other: FileIcon,
};

export function FileTypeIcon({type, size = 16, ...props}: FileIconProps) {
    const Icon = iconMap[type] || FileIcon;
    return <Icon size={size} {...props} />;
}