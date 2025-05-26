export type FileType =
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'archive'
    | 'code'
    | 'pdf'
    | 'folder'
    | 'apk'
    | 'other';

export interface MinioObject {
    key: string;
    name: string;
    lastModified: Date;
    size: number;
    type: FileType;
    path: string;
    isFolder: boolean;
}

export interface MinioBucket {
    name: string;
}

export interface MinioPath {
    name: string;
    path: string;
    isRoot: boolean;
}

// Helper to determine file type based on extension
export function getFileType(filename: string): FileType {
    if (!filename.includes('.')) return 'other';
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const fileTypeMap: Record<string, FileType> = {
        // Images
        jpg: 'image',
        jpeg: 'image',
        png: 'image',
        gif: 'image',
        svg: 'image',
        webp: 'image',
        bmp: 'image',
        // Videos
        mp4: 'video',
        mov: 'video',
        avi: 'video',
        mkv: 'video',
        webm: 'video',
        wmv: 'video',
        // Audio
        mp3: 'audio',
        wav: 'audio',
        ogg: 'audio',
        flac: 'audio',
        aac: 'audio',
        // Documents
        doc: 'document',
        docx: 'document',
        xls: 'document',
        xlsx: 'document',
        ppt: 'document',
        pptx: 'document',
        txt: 'document',
        rtf: 'document',
        // Archives
        zip: 'archive',
        rar: 'archive',
        tar: 'archive',
        gz: 'archive',
        '7z': 'archive',
        // Code
        js: 'code',
        ts: 'code',
        jsx: 'code',
        tsx: 'code',
        html: 'code',
        css: 'code',
        scss: 'code',
        json: 'code',
        md: 'code',
        yaml: 'code',
        yml: 'code',
        // PDF
        pdf: 'pdf',
    };

    return fileTypeMap[extension] || 'other';
}

