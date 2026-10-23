import { mock } from 'bun:test'

export const secureStore = new Map<string, string>()
export const mmkvStore = new Map<string, string>()
export const appStorageStore = new Map<string, boolean>()

export const loadSecureAsyncMock = mock(async (key: string) => {
	return secureStore.get(key) ?? null
})

export const saveSecureAsyncMock = mock(async (key: string, value: string) => {
	secureStore.set(key, value)
})

export const deleteSecureMock = mock(async (key: string) => {
	secureStore.delete(key)
})

export const appStorageSetMock = mock((key: string, value: boolean) => {
	appStorageStore.set(key, value)
})

export const appStorageRemoveMock = mock((key: string) => {
	appStorageStore.delete(key)
})

export const appStorageGetBooleanMock = mock((key: string) => {
	return appStorageStore.get(key)
})

export const storageMock = {
	loadSecureAsync: loadSecureAsyncMock,
	saveSecureAsync: saveSecureAsyncMock,
	deleteSecure: deleteSecureMock,
	storage: {
		getString: (key: string) => mmkvStore.get(key),
		set: (key: string, value: string) => {
			mmkvStore.set(key, value)
		},
		clearAll: () => {
			mmkvStore.clear()
		}
	},
	// Keep a stable object identity — Bun sticky mocks capture this once.
	appStorage: {
		set: appStorageSetMock,
		remove: appStorageRemoveMock,
		getBoolean: appStorageGetBooleanMock
	}
}

export function resetAppStorage(): void {
	appStorageStore.clear()
	appStorageSetMock.mockClear()
	appStorageRemoveMock.mockClear()
	appStorageGetBooleanMock.mockClear()
}

export function resetSecureStores(): void {
	secureStore.clear()
	mmkvStore.clear()
	loadSecureAsyncMock.mockReset()
	loadSecureAsyncMock.mockImplementation(async (key: string) => {
		return secureStore.get(key) ?? null
	})
	saveSecureAsyncMock.mockReset()
	saveSecureAsyncMock.mockImplementation(async (key: string, value: string) => {
		secureStore.set(key, value)
	})
	deleteSecureMock.mockReset()
	deleteSecureMock.mockImplementation(async (key: string) => {
		secureStore.delete(key)
	})
	resetAppStorage()
}
