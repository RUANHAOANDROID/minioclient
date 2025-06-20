import {MinioBucket, MinioObject} from '@/types/minio';
import keycloak from "@/lib/keycloak.ts";
import {deleteObject, downloadObjectWithProgress, getObjects, uploadObject} from "@/lib/api.ts";
import {ApiResponse} from "@/types/ApiResponse.ts";
import {UploadResponse} from "@/types/UploadResponse.ts";

// 列出所有 buckets，返回 MinioBucket[]
export async function listBuckets(): Promise<MinioBucket[]> {
    const groups = keycloak.tokenParsed?.groups || [];
    return groups.map((name: string) => ({name: name.replace(/^\/+/, "")}));
}

// List objects in a bucket with optional prefix
export async function listObjects(bucket: string, prefix: string = ''): Promise<MinioObject[]> {
    const resp = await getObjects(bucket, prefix);
    console.log(resp)
    return resp.data;
}

// Upload a file to MinIO
export async function uploadFile(
    bucket: string,
    path: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<ApiResponse<UploadResponse>> {
    return uploadObject(bucket, path, file , onProgress)
}

// Download a file from MinIO
export async function downloadFile(
    bucket: string,
    object: string,
    onProgress?: (progress: number) => void
): Promise<Blob> {
    console.log(bucket, object, onProgress);
    return downloadObjectWithProgress(bucket,object);
}

// Delete a file from MinIO
export async function deleteFile(bucket: string, objectName: string): Promise<string> {
    console.log(bucket, objectName);
    const resp = await deleteObject(bucket, objectName);
    return resp.data;
}
