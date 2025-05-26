export interface UploadResponse {
    bucket: string;
    key: string;
    etag: string;
    size: number;
    objectName: string;
}