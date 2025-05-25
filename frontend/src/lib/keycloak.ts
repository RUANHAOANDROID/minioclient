import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'https://auth.ahaodev.com', // Keycloak 服务器的相对路径
    realm: 'drop',  // Realm 名称
    clientId: 'client-drop' // 客户端 ID
});

export interface S3Credentials {
    accessKey: string;
    secretKey: string;
}

export function getS3CredentialsFromToken(): S3Credentials | null {
    try {
        // 获取 token 中的自定义属性
        const token = keycloak.tokenParsed;
        if (!token) {
            console.warn('No token found');
            return null;
        }

        // 从 token 中获取自定义属性
        const accessKey = token['s3_access_key'];
        const secretKey = token['s3_secret_key'];

        // 打印 token 内容用于调试
        console.log('Token content:', token);

        if (!accessKey || !secretKey) {
            console.warn('Missing S3 credentials in token');
            return null;
        }

        return {
            accessKey: accessKey as string,
            secretKey: secretKey as string
        };
    } catch (error) {
        console.error('Failed to get S3 credentials from token:', error);
        return null;
    }
}

// export function printS3Credentials() {
//     const credentials = getS3CredentialsFromToken();
//     if (credentials) {
//         console.log('S3 Access Key:', credentials.accessKey);
//         console.log('S3 Secret Key:', credentials.secretKey);
//     } else {
//         console.warn('No S3 credentials available');
//     }
// }

export default keycloak;