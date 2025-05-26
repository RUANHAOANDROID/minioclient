import keycloak from "@/lib/keycloak.ts";
import axios from "axios";
import {ApiResponse} from "@/types/ApiResponse.ts";
import {MinioObject} from "@/types/minio.ts";

// 定义基本的 Axios 配置
const baseURL = `${window.location.protocol}//${window.location.host}`;
const apiClient = axios.create({
    baseURL: baseURL ,
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
    const resp = await apiClient.get("/api/v1/list", { params: { bucket, prefix } });
    return resp.data;
}

// 下载对象（普通下载，参数为 oid）
export async function downloadObject(oid: string): Promise<Blob> {
    const resp = await apiClient.get(`/download/${oid}`, { responseType: "blob" });
    return resp.data;
}

// 下载对象（带进度，参数为 oid）
export async function downloadObjectWithProgress(oid: string): Promise<Blob> {
    const resp = await apiClient.get(`/download-p/${oid}`, { responseType: "blob" });
    return resp.data;
}

// 删除对象
export async function deleteObject(bucket:string,object: string): Promise<ApiResponse<any>> {
    console.log("delete object",bucket, object);
    const resp = await apiClient.delete("/api/v1/delete", {
        params: { bucket, object }
    });
    return resp.data;
}

// 上传对象
export async function uploadObject(oid: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("file", file);
    const resp = await apiClient.post(`/upload/${oid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return resp.data;
}

export { apiClient as api };
