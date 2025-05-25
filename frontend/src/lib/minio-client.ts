import {MinioBucket, MinioObject} from '@/types/minio';
import keycloak from "@/lib/keycloak.ts";
import {getObjects} from "@/lib/api.ts";

// 列出所有 buckets，返回 MinioBucket[]
export async function listBuckets(): Promise<MinioBucket[]> {
    const groups = keycloak.tokenParsed?.groups || [];
    return groups.map((name: string) => ({name: name.replace(/^\/+/, "")}));
}

// List objects in a bucket with optional prefix
export async function listObjects(bucket: string, prefix: string = ''): Promise<MinioObject[]> {
    const resp = await getObjects(bucket, prefix);
    console.log(resp)
    return resp.data.map((item: any) => ({
        key: item.key,
        name: item.name,
        lastModified: new Date(item.lastModified),
        size: item.size,
        type: item.type,
        path: item.path,
        isFolder: item.isFolder,
    }));
}

// Upload a file to MinIO
export async function uploadFile(
    bucket: string,
    objectName: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<void> {
    console.log(bucket, objectName, file, onProgress);
    //const resp =await DownloadObject(objectName);
}

// Download a file from MinIO
export async function downloadFile(
    bucket: string,
    objectName: string,
    onProgress?: (progress: number) => void
): Promise<Blob> {
    console.log(bucket, objectName, onProgress);
    //TODO
    return new Blob(); // 模拟返回一个空的 Blob 对象
}

// Delete a file from MinIO
export async function deleteFile(bucket: string, objectName: string): Promise<void> {
    console.log(bucket, objectName);
    //TODO
}
