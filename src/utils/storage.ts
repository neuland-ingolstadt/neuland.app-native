import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { MMKV } from 'react-native-mmkv'
import type { StateStorage } from 'zustand/middleware'
import CredentialStorage from './credentialStorage'

export const storage = new MMKV({
	id: 'query-client-storage'
})

// Initialize the credential storage for web
let webCredentialStorage: CredentialStorage | null = null
if (Platform.OS === 'web' && typeof window !== 'undefined') {
	try {
		webCredentialStorage = new CredentialStorage('neuland-secure-storage')
	} catch (error) {
		console.error('Failed to initialize IndexedDB credential storage:', error)
	}
}

export async function saveSecureAsync(
	key: string,
	value: string
): Promise<void> {
	if (Platform.OS === 'web') {
		if (!webCredentialStorage) {
			// Don't save at all if webCredentialStorage is not available
			console.error('Web credential storage is not initialized.')
			return
		}

		try {
			await webCredentialStorage.write(key, { value })
		} catch (error) {
			console.error('Failed to write to IndexedDB:', error)
		}

		return
	}
	await SecureStore.setItemAsync(key, value)
}

export async function loadSecureAsync(key: string): Promise<string | null> {
	try {
		if (Platform.OS === 'web') {
			if (!webCredentialStorage) {
				console.error('Web credential storage is not initialized.')
				return null
			}

			try {
				const data = await webCredentialStorage.read(key)
				if (!data || 'value' in data === false) {
					return null
				}

				return data.value as string
			} catch (error) {
				console.error('Failed to read from IndexedDB:', error)
			}

			return null
		}
		return await SecureStore.getItemAsync(key)
	} catch (error) {
		console.error(`Failed to load secure item with key ${key}:`, error)
		return null
	}
}

export async function deleteSecure(key: string): Promise<void> {
	if (Platform.OS === 'web') {
		if (!webCredentialStorage) {
			console.error('Web credential storage is not initialized.')
			return
		}

		try {
			await webCredentialStorage.delete(key)
		} catch (error) {
			console.error('Failed to delete from IndexedDB:', error)
		}

		return
	}
	await SecureStore.deleteItemAsync(key)
}

const clientStorage = {
	setItem: (key: string, value: string | number | boolean | ArrayBuffer) => {
		if (value instanceof ArrayBuffer) {
			storage.set(key, value)
		} else {
			storage.set(key, value)
		}
	},
	getItem: (key: string) => {
		const value = storage.getString(key)
		return value ?? null
	},
	removeItem: (key: string) => {
		storage.delete(key)
	}
}

export const syncStoragePersister = createSyncStoragePersister({
	storage: clientStorage
})

export const appStorage = new MMKV({
	id: 'user-settings-storage'
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
	}
}
