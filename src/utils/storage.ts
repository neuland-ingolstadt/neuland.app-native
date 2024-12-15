import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { MMKV } from 'react-native-mmkv'
import { type StateStorage } from 'zustand/middleware'

export const storage = new MMKV({
    id: 'query-client-storage',
})

export const secureWebStorage = new MMKV({
    id: 'secure-web-storage',
})

export async function saveSecure(
    key: string,
    value: string,
    insecureWeb = false
): Promise<void> {
    if (Platform.OS === 'web') {
        if (!insecureWeb) {
            // Saving secure data in a browser is not possible, so we do nothing here. The user needs to sign in again as long as we cannot use single sign-on.
            return
        }
        secureWebStorage.set(key, value)
        await Promise.resolve()
        return
    }
    await SecureStore.setItemAsync(key, value)
}

export function loadSecure(key: string): string | null {
    if (Platform.OS === 'web') {
        return secureWebStorage.getString(key) ?? null
    }
    return SecureStore.getItem(key)
}

export async function deleteSecure(key: string): Promise<void> {
    if (Platform.OS === 'web') {
        secureWebStorage.delete(key)
        await Promise.resolve()
        return
    }
    await SecureStore.deleteItemAsync(key)
}

const clientStorage = {
    setItem: (key: string, value: string | number | boolean | ArrayBuffer) => {
        storage.set(key, value)
    },
    getItem: (key: string) => {
        const value = storage.getString(key)
        return value ?? null
    },
    removeItem: (key: string) => {
        storage.delete(key)
    },
}

export const syncStoragePersister = createSyncStoragePersister({
    storage: clientStorage,
})

export const appStorage = new MMKV({
    id: 'user-settings-storage',
})

export const zustandStorage: StateStorage = {
    setItem(name, value) {
        appStorage.set(name, value)
    },
    getItem(name) {
        const value = appStorage.getString(name)
        return value ?? null
    },
    removeItem(name) {
        appStorage.delete(name)
    },
}
