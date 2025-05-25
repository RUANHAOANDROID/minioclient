import { FileType, MinioBucket, MinioObject } from '@/types/minio';

// Helper to determine file type based on extension
export function getFileType(filename: string): FileType {
  if (!filename.includes('.')) return 'other';
  
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const fileTypeMap: Record<string, FileType> = {
    // Images
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', svg: 'image', webp: 'image', bmp: 'image',
    // Videos
    mp4: 'video', mov: 'video', avi: 'video', mkv: 'video', webm: 'video', wmv: 'video',
    // Audio
    mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', aac: 'audio',
    // Documents
    doc: 'document', docx: 'document', xls: 'document', xlsx: 'document', ppt: 'document', pptx: 'document', txt: 'document', rtf: 'document',
    // Archives
    zip: 'archive', rar: 'archive', tar: 'archive', gz: 'archive', '7z': 'archive',
    // Code
    js: 'code', ts: 'code', jsx: 'code', tsx: 'code', html: 'code', css: 'code', scss: 'code', json: 'code', md: 'code', yaml: 'code', yml: 'code',
    // PDF
    pdf: 'pdf',
  };

  return fileTypeMap[extension] || 'other';
}

// Generate random size between min and max KB
function randomSize(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1024;
}

// Generate random date in the last 60 days
function randomDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 60);
  return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}

// Mock buckets
export const mockBuckets: MinioBucket[] = [
  { name: 'documents', creationDate: new Date('2024-03-15') },
  { name: 'images', creationDate: new Date('2024-02-20') },
  { name: 'backups', creationDate: new Date('2024-01-10') },
  { name: 'media', creationDate: new Date('2024-04-05') },
  { name: 'logs', creationDate: new Date('2024-03-01') },
];

// Function to generate mock objects for a bucket and path
export function getMockObjects(bucket: string, path: string = ''): MinioObject[] {
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  const pathParts = normalizedPath.split('/').filter(Boolean);
  
  // Special cases for different buckets to provide variety
  switch (bucket) {
    case 'documents':
      return generateDocumentsBucket(pathParts);
    case 'images':
      return generateImagesBucket(pathParts);
    case 'backups':
      return generateBackupsBucket(pathParts);
    case 'media':
      return generateMediaBucket(pathParts);
    case 'logs':
      return generateLogsBucket(pathParts);
    default:
      return [];
  }
}

function generateDocumentsBucket(pathParts: string[]): MinioObject[] {
  if (pathParts.length === 0) {
    return [
      createFolder('projects', 'projects', ''),
      createFolder('personal', 'personal', ''),
      createFolder('contracts', 'contracts', ''),
      createFile('readme.txt', 'readme.txt', '', 'document'),
      createFile('index.html', 'index.html', '', 'code'),
    ];
  } else if (pathParts[0] === 'projects') {
    if (pathParts.length === 1) {
      return [
        createFolder('project-a', 'project-a', 'projects/'),
        createFolder('project-b', 'project-b', 'projects/'),
        createFile('projects-overview.docx', 'projects-overview.docx', 'projects/', 'document'),
        createFile('budget-2024.xlsx', 'budget-2024.xlsx', 'projects/', 'document'),
      ];
    } else if (pathParts[1] === 'project-a') {
      return [
        createFile('specifications.pdf', 'specifications.pdf', 'projects/project-a/', 'pdf'),
        createFile('timeline.xlsx', 'timeline.xlsx', 'projects/project-a/', 'document'),
        createFile('design-mockups.png', 'design-mockups.png', 'projects/project-a/', 'image'),
      ];
    } else if (pathParts[1] === 'project-b') {
      return [
        createFile('contract.pdf', 'contract.pdf', 'projects/project-b/', 'pdf'),
        createFile('meeting-notes.docx', 'meeting-notes.docx', 'projects/project-b/', 'document'),
      ];
    }
  } else if (pathParts[0] === 'personal') {
    return [
      createFile('resume.pdf', 'resume.pdf', 'personal/', 'pdf'),
      createFile('cover-letter.docx', 'cover-letter.docx', 'personal/', 'document'),
      createFile('contact-list.xlsx', 'contact-list.xlsx', 'personal/', 'document'),
    ];
  } else if (pathParts[0] === 'contracts') {
    return [
      createFile('nda-template.pdf', 'nda-template.pdf', 'contracts/', 'pdf'),
      createFile('service-agreement.docx', 'service-agreement.docx', 'contracts/', 'document'),
      createFile('client-list.xlsx', 'client-list.xlsx', 'contracts/', 'document'),
    ];
  }
  
  return [];
}

function generateImagesBucket(pathParts: string[]): MinioObject[] {
  if (pathParts.length === 0) {
    return [
      createFolder('vacation', 'vacation', ''),
      createFolder('product-photos', 'product-photos', ''),
      createFolder('marketing', 'marketing', ''),
      createFile('logo.png', 'logo.png', '', 'image'),
      createFile('banner.jpg', 'banner.jpg', '', 'image'),
    ];
  } else if (pathParts[0] === 'vacation') {
    return [
      createFile('beach.jpg', 'beach.jpg', 'vacation/', 'image'),
      createFile('mountain.jpg', 'mountain.jpg', 'vacation/', 'image'),
      createFile('family-photo.jpg', 'family-photo.jpg', 'vacation/', 'image'),
      createFile('hotel.jpg', 'hotel.jpg', 'vacation/', 'image'),
    ];
  } else if (pathParts[0] === 'product-photos') {
    return [
      createFile('product-1.png', 'product-1.png', 'product-photos/', 'image'),
      createFile('product-2.png', 'product-2.png', 'product-photos/', 'image'),
      createFile('product-3.png', 'product-3.png', 'product-photos/', 'image'),
      createFile('product-specs.pdf', 'product-specs.pdf', 'product-photos/', 'pdf'),
    ];
  } else if (pathParts[0] === 'marketing') {
    return [
      createFile('campaign-banner.jpg', 'campaign-banner.jpg', 'marketing/', 'image'),
      createFile('social-media-post.png', 'social-media-post.png', 'marketing/', 'image'),
      createFile('brochure.pdf', 'brochure.pdf', 'marketing/', 'pdf'),
    ];
  }
  
  return [];
}

function generateBackupsBucket(pathParts: string[]): MinioObject[] {
  if (pathParts.length === 0) {
    return [
      createFolder('database', 'database', ''),
      createFolder('website', 'website', ''),
      createFolder('configs', 'configs', ''),
      createFile('backup-log.txt', 'backup-log.txt', '', 'document'),
    ];
  } else if (pathParts[0] === 'database') {
    return [
      createFile('db-backup-2024-01-01.sql', 'db-backup-2024-01-01.sql', 'database/', 'code'),
      createFile('db-backup-2024-02-01.sql', 'db-backup-2024-02-01.sql', 'database/', 'code'),
      createFile('db-backup-2024-03-01.sql', 'db-backup-2024-03-01.sql', 'database/', 'code'),
      createFile('db-backup-2024-04-01.sql', 'db-backup-2024-04-01.sql', 'database/', 'code'),
    ];
  } else if (pathParts[0] === 'website') {
    return [
      createFile('website-backup-2024-01.zip', 'website-backup-2024-01.zip', 'website/', 'archive'),
      createFile('website-backup-2024-02.zip', 'website-backup-2024-02.zip', 'website/', 'archive'),
      createFile('website-backup-2024-03.zip', 'website-backup-2024-03.zip', 'website/', 'archive'),
      createFile('website-backup-2024-04.zip', 'website-backup-2024-04.zip', 'website/', 'archive'),
    ];
  } else if (pathParts[0] === 'configs') {
    return [
      createFile('nginx.conf', 'nginx.conf', 'configs/', 'code'),
      createFile('apache.conf', 'apache.conf', 'configs/', 'code'),
      createFile('docker-compose.yml', 'docker-compose.yml', 'configs/', 'code'),
    ];
  }
  
  return [];
}

function generateMediaBucket(pathParts: string[]): MinioObject[] {
  if (pathParts.length === 0) {
    return [
      createFolder('videos', 'videos', ''),
      createFolder('audio', 'audio', ''),
      createFolder('presentations', 'presentations', ''),
      createFile('media-catalog.xlsx', 'media-catalog.xlsx', '', 'document'),
    ];
  } else if (pathParts[0] === 'videos') {
    return [
      createFile('promotional-video.mp4', 'promotional-video.mp4', 'videos/', 'video'),
      createFile('interview.mp4', 'interview.mp4', 'videos/', 'video'),
      createFile('product-demo.mp4', 'product-demo.mp4', 'videos/', 'video'),
      createFile('event-recording.mp4', 'event-recording.mp4', 'videos/', 'video'),
    ];
  } else if (pathParts[0] === 'audio') {
    return [
      createFile('podcast-episode-1.mp3', 'podcast-episode-1.mp3', 'audio/', 'audio'),
      createFile('podcast-episode-2.mp3', 'podcast-episode-2.mp3', 'audio/', 'audio'),
      createFile('sound-effects.wav', 'sound-effects.wav', 'audio/', 'audio'),
      createFile('music-track.mp3', 'music-track.mp3', 'audio/', 'audio'),
    ];
  } else if (pathParts[0] === 'presentations') {
    return [
      createFile('company-overview.pptx', 'company-overview.pptx', 'presentations/', 'document'),
      createFile('quarterly-results.pptx', 'quarterly-results.pptx', 'presentations/', 'document'),
      createFile('marketing-strategy.pdf', 'marketing-strategy.pdf', 'presentations/', 'pdf'),
    ];
  }
  
  return [];
}

function generateLogsBucket(pathParts: string[]): MinioObject[] {
  if (pathParts.length === 0) {
    return [
      createFolder('server-logs', 'server-logs', ''),
      createFolder('application-logs', 'application-logs', ''),
      createFolder('access-logs', 'access-logs', ''),
      createFile('log-summary.xlsx', 'log-summary.xlsx', '', 'document'),
    ];
  } else if (pathParts[0] === 'server-logs') {
    return [
      createFile('server-log-2024-01.log', 'server-log-2024-01.log', 'server-logs/', 'document'),
      createFile('server-log-2024-02.log', 'server-log-2024-02.log', 'server-logs/', 'document'),
      createFile('server-log-2024-03.log', 'server-log-2024-03.log', 'server-logs/', 'document'),
      createFile('server-log-2024-04.log', 'server-log-2024-04.log', 'server-logs/', 'document'),
    ];
  } else if (pathParts[0] === 'application-logs') {
    return [
      createFile('app-log-2024-01.log', 'app-log-2024-01.log', 'application-logs/', 'document'),
      createFile('app-log-2024-02.log', 'app-log-2024-02.log', 'application-logs/', 'document'),
      createFile('app-log-2024-03.log', 'app-log-2024-03.log', 'application-logs/', 'document'),
      createFile('app-log-2024-04.log', 'app-log-2024-04.log', 'application-logs/', 'document'),
      createFile('error-log.log', 'error-log.log', 'application-logs/', 'document'),
    ];
  } else if (pathParts[0] === 'access-logs') {
    return [
      createFile('access-log-2024-01.log', 'access-log-2024-01.log', 'access-logs/', 'document'),
      createFile('access-log-2024-02.log', 'access-log-2024-02.log', 'access-logs/', 'document'),
      createFile('access-log-2024-03.log', 'access-log-2024-03.log', 'access-logs/', 'document'),
      createFile('access-log-2024-04.log', 'access-log-2024-04.log', 'access-logs/', 'document'),
    ];
  }
  
  return [];
}

// Helper functions to create folder and file objects
function createFolder(name: string, key: string, parentPath: string): MinioObject {
  return {
    key: `${parentPath}${key}/`,
    name,
    lastModified: randomDate(),
    size: 0,
    type: 'folder',
    path: `${parentPath}${key}/`,
    isFolder: true,
  };
}

function createFile(name: string, key: string, parentPath: string, type: FileType): MinioObject {
  return {
    key: `${parentPath}${key}`,
    name,
    lastModified: randomDate(),
    size: randomSize(10, 10000),
    type: type || getFileType(name),
    path: `${parentPath}${key}`,
    isFolder: false,
  };
}