export type FileType = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'document' 
  | 'archive' 
  | 'code' 
  | 'pdf'
  | 'folder'
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
  creationDate: Date;
}

export interface MinioPath {
  name: string;
  path: string;
  isRoot: boolean;
}