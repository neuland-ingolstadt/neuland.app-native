import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

const clientStorage = {
    setItem: (key: string, value: string | number | boolean | Uint8Array) => {
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
