import keycloak from "@/lib/keycloak.ts";

const BUCKET_KEY = 'currentBucket';

export function storeCurrentBucket(bucket: string) {
    const key = keycloak.tokenParsed?.groups || BUCKET_KEY;
    localStorage.setItem(key, bucket);
}

export function getCurrentBucket(): string | null {
    const key = keycloak.tokenParsed?.groups || BUCKET_KEY;
    return localStorage.getItem(key);
}

export function clearCurrentBucket() {
    const key = keycloak.tokenParsed?.groups || BUCKET_KEY;
    localStorage.removeItem(key);
}