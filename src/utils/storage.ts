import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { MMKV } from 'react-native-mmkv'
import { type StateStorage } from 'zustand/middleware'

export const storage = new MMKV({
    id: 'query-client-storage',
})

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
