import { S3Client, ListBucketsCommand, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CreateBucketCommand, DeleteBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileType, MinioBucket, MinioObject } from '@/types/minio';
import { getS3CredentialsFromToken } from '@/lib/keycloak.ts';

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

// Initialize S3 client
function getS3Client() {
  const credentials = getS3CredentialsFromToken();
  if (!credentials) {
    throw new Error('No S3 credentials available');
  }

  return new S3Client({
    endpoint: 'https://s3c.ahaodev.com',
    region: 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKey,
      secretAccessKey: credentials.secretKey,
    },
    forcePathStyle: true,
  });
}

// List all buckets
export async function listBuckets(): Promise<MinioBucket[]> {
  try {
    const client = getS3Client();
    const command = new ListBucketsCommand({});
    const url = await getSignedUrl(client, command, { 
      expiresIn: 3600,
      signingRegion: 'us-east-1',
      signingService: 's3',
    });
    
    const correctedUrl = url.replace('s3.ahaodev.com', 's3c.ahaodev.com');
    
    const response = await fetch(correctedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log('Raw response:', text);

    // 解析XML响应
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const buckets = Array.from(doc.getElementsByTagName('Bucket'));
    
    return buckets.map(bucket => {
      const name = bucket.getElementsByTagName('Name')[0]?.textContent || '';
      const creationDate = bucket.getElementsByTagName('CreationDate')[0]?.textContent || '';
      return {
        name,
        creationDate: new Date(creationDate),
      };
    });
  } catch (error) {
    console.error('Error listing buckets:', error);
    throw error;
  }
}

// List objects in a bucket with optional prefix
export async function listObjects(bucket: string, prefix: string = ''): Promise<MinioObject[]> {
  try {
    const client = getS3Client();
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/',
    });
    const url = await getSignedUrl(client, command, { 
      expiresIn: 3600,
      signingRegion: 'us-east-1',
      signingService: 's3',
    });
    
    const correctedUrl = url.replace('s3.ahaodev.com', 's3c.ahaodev.com');
    
    const response = await fetch(correctedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log('Raw response:', text);

    // 解析XML响应
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const objects: MinioObject[] = [];

    // 处理文件夹
    const commonPrefixes = doc.getElementsByTagName('CommonPrefixes');
    for (const commonPrefix of commonPrefixes) {
      const prefixElement = commonPrefix.getElementsByTagName('Prefix')[0];
      if (prefixElement?.textContent) {
        const folderName = prefixElement.textContent.slice(prefix.length, -1);
        objects.push({
          key: prefixElement.textContent,
          name: folderName,
          lastModified: new Date(),
          size: 0,
          type: 'folder',
          path: prefix,
          isFolder: true,
        });
      }
    }

    // 处理文件
    const contents = doc.getElementsByTagName('Contents');
    for (const content of contents) {
      const key = content.getElementsByTagName('Key')[0]?.textContent;
      if (key && !key.endsWith('/')) {
        const fileName = key.slice(prefix.length);
        const lastModified = content.getElementsByTagName('LastModified')[0]?.textContent;
        const size = content.getElementsByTagName('Size')[0]?.textContent;
        
        objects.push({
          key,
          name: fileName,
          lastModified: lastModified ? new Date(lastModified) : new Date(),
          size: size ? parseInt(size) : 0,
          type: getFileType(fileName),
          path: prefix,
          isFolder: false,
        });
      }
    }

    return objects;
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
}

// Upload a file to MinIO
export async function uploadFile(
  bucket: string,
  objectName: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    const client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectName,
      ContentType: file.type,
    });
    const url = await getSignedUrl(client, command, {
      expiresIn: 3600,
      signingRegion: 'us-east-1',
      signingService: 's3',
    });
    if(onProgress){
      onProgress(0);
    }
    const correctedUrl = url.replace('s3.ahaodev.com', 's3c.ahaodev.com');

    const response = await fetch(correctedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file, // 直接使用文件对象
    });
    if(onProgress){
      onProgress(100);
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Download a file from MinIO
export async function downloadFile(
  bucket: string,
  objectName: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    const client = getS3Client();
    const command = new GetObjectCommand({ Bucket: bucket, Key: objectName });
    const url = (await getSignedUrl(client, command, {
      expiresIn: 3600,
      signingRegion: 'us-east-1',
      signingService: 's3',
    })).replace('s3.ahaodev.com', 's3c.ahaodev.com');
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (!response.body) {
      throw new Error('ReadableStream not supported in this browser');
    }
    const reader = response.body.getReader();
    const contentLength = Number(response.headers.get('Content-Length') || 0);
    let receivedLength = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        receivedLength += value.length;

        if (onProgress && contentLength > 0) {
          const progress = Math.min(
              Math.round((receivedLength / contentLength) * 100),
              100
          );
          console.log(progress)
          onProgress(progress);
        }
      }
    }

    return new Blob(chunks);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

// Delete a file from MinIO
export async function deleteFile(bucket: string, objectName: string): Promise<void> {
  try {
    const client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectName,
    });
    const url = await getSignedUrl(client, command, { 
      expiresIn: 3600,
      signingRegion: 'us-east-1',
      signingService: 's3',
    });
    
    const correctedUrl = url.replace('s3.ahaodev.com', 's3c.ahaodev.com');
    
    const response = await fetch(correctedUrl, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Create a new bucket
export async function createBucket(bucketName: string): Promise<void> {
  try {
    const client = getS3Client();
    const command = new CreateBucketCommand({
      Bucket: bucketName,
    });
    const url = await getSignedUrl(client, command, { 
      expiresIn: 3600,
      signingRegion: 'us-east-1',
      signingService: 's3',
    });
    
    const correctedUrl = url.replace('s3.ahaodev.com', 's3c.ahaodev.com');
    
    const response = await fetch(correctedUrl, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error creating bucket:', error);
    throw error;
  }
}

// Delete a bucket
export async function deleteBucket(bucketName: string): Promise<void> {
  try {
    const client = getS3Client();
    const command = new DeleteBucketCommand({
      Bucket: bucketName,
    });
    const url = await getSignedUrl(client, command, { 
      expiresIn: 3600,
      signingRegion: 'us-east-1',
      signingService: 's3',
    });
    
    const correctedUrl = url.replace('s3.ahaodev.com', 's3c.ahaodev.com');
    
    const response = await fetch(correctedUrl, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting bucket:', error);
    throw error;
  }
} 