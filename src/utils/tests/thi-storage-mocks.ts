import { mock } from 'bun:test'

export const secureStore = new Map<string, string>()
export const mmkvStore = new Map<string, string>()

export const loadSecureAsyncMock = mock(async (key: string) => {
	return secureStore.get(key) ?? null
})

export const saveSecureAsyncMock = mock(async (key: string, value: string) => {
	secureStore.set(key, value)
})

export const deleteSecureMock = mock(async (key: string) => {
	secureStore.delete(key)
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
	appStorage: {
		set: () => {},
		remove: () => {},
		getBoolean: () => false
	}
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
}
