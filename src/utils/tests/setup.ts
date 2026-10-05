import { mock } from 'bun:test'
import { mockReactNative } from './react-native-mock'
import { thiApiMock } from './thi-api-mocks'
import { storageMock } from './thi-storage-mocks'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const globalWithDev = globalThis as typeof globalThis & { __DEV__?: boolean }
if (globalWithDev.__DEV__ === undefined) {
	globalWithDev.__DEV__ = false
}

type ExpoGlobalStub = {
	expo?: {
		EventEmitter: new () => {
			addListener: () => { remove: () => void }
			removeListener: () => void
			removeAllListeners: () => void
			emit: () => void
			listenerCount: () => number
		}
	}
}

const globalWithExpo = globalThis as unknown as ExpoGlobalStub
if (globalWithExpo.expo == null) {
	class ExpoTestEventEmitter {
		addListener() {
			return { remove: () => {} }
		}
		removeListener() {}
		removeAllListeners() {}
		emit() {}
		listenerCount() {
			return 0
		}
	}
	globalWithExpo.expo = { EventEmitter: ExpoTestEventEmitter }
}

mockReactNative()

void mock.module('expo-application', () => ({
	nativeApplicationVersion: '0.0.0-test'
}))

// Register shared mocks first so sticky Bun mock.module always has complete exports.
void mock.module(`${SRC_ROOT}utils/storage.ts`, () => storageMock)
void mock.module('@/utils/storage', () => storageMock)
void mock.module(`${SRC_ROOT}api/thi-api.ts`, () => thiApiMock)
void mock.module('@/api/thi-api', () => thiApiMock)
