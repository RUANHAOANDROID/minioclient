import keycloak from "@/lib/keycloak.ts";
import axios from "axios";
import {ApiResponse} from "@/types/ApiResponse.ts";
import {MinioObject} from "@/types/minio.ts";
import {UploadResponse} from "@/types/UploadResponse.ts";

// 定义基本的 Axios 配置
const baseURL = `${window.location.protocol}//${window.location.host}`;

const apiClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 动态设置 Authorization 头部
apiClient.interceptors.request.use((config) => {
    console.log(config.baseURL);
    if (keycloak.authenticated ? keycloak.authenticated : false) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${keycloak.token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        console.log(`response interceptors success: ${response}`)
        // 返回正常响应
        return response;
    },
    (error) => {
        console.log(`response interceptors error: ${error}`)
        // 判断是否是 401 错误
        if (error.response && error.response.status === 401) {
            console.log(`response interceptors 401 logout!`)
            keycloak.logout().then((r) => {
                console.log(r)
                window.location.reload();
            }).catch(err => {
                console.log(err)
            });
        }
        // 返回 Promise.reject，避免出现未捕获的错误
        return Promise.reject(error);
    }
)

// 获取对象列表
export async function getObjects(bucket?: string, prefix?: string): Promise<ApiResponse<MinioObject[]>> {
    const resp = await apiClient.get("/api/v1/list", {params: {bucket, prefix}});
    return resp.data;
}


// 下载对象（带进度，参数为 object）
export async function downloadObjectWithProgress(bucket:string,object: string): Promise<Blob> {
    const resp = await apiClient.get(`/api/v1/download`, {
        params: {bucket, object},
        responseType: "blob"
    });
    return resp.data;
}

// 删除对象
export async function deleteObject(bucket: string, object: string): Promise<ApiResponse<string>> {
    console.log("delete object", bucket, object);
    const resp = await apiClient.delete("/api/v1/delete", {
        params: {bucket, object}
    });
    return resp.data;
}

// 上传对象（带进度监控）
export async function uploadObject(
    bucket: string,
    prefix: string,
    upFile: File,
    onProgress?: (percentage: number) => void
): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append("file", upFile);
    // 构建查询参数
    const params = new URLSearchParams();
    params.append("bucket", bucket);
    if (prefix) {
        params.append("prefix", prefix);
    }
    // 发送请求并监控进度
    const resp = await apiClient.post(`/api/v1/upload?${params.toString()}`, formData, {
        headers: {"Content-Type": "multipart/form-data"},
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentage);
            }
        }
    });
    return resp.data;
}