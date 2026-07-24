import * as SecureStore from "expo-secure-store";

import { AUTH_STORAGE_KEYS } from "./storageKeys";

export interface AuthTokens {
    access: string;
    refresh: string;
}

export async function getStoredTokens(): Promise<Partial<AuthTokens>> {
    const [access, refresh] = await Promise.all([
        SecureStore.getItemAsync(AUTH_STORAGE_KEYS.ACCESS),
        SecureStore.getItemAsync(AUTH_STORAGE_KEYS.REFRESH),
    ]);

    return { access: access ?? undefined, refresh: refresh ?? undefined };
}

export async function getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(AUTH_STORAGE_KEYS.ACCESS);
}

export async function persistTokens({ access, refresh }: AuthTokens): Promise<void> {
    await Promise.all([
        SecureStore.setItemAsync(AUTH_STORAGE_KEYS.ACCESS, access),
        SecureStore.setItemAsync(AUTH_STORAGE_KEYS.REFRESH, refresh),
    ]);
}

export async function clearTokens(): Promise<void> {
    await Promise.all([
        SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.ACCESS),
        SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.REFRESH),
    ]);
}