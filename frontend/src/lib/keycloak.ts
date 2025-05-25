import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'https://auth.ahaodev.com', // Keycloak 服务器的相对路径
    realm: 'drop-realm',  // Realm 名称
    clientId: 'client-drop' // 客户端 ID
});

export function getGroups(): string[] | null {
    return keycloak.tokenParsed?.groups || null;
}

export default keycloak;