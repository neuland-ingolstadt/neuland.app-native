import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const storageState = new Map<string, boolean>()

const appStorageMock = {
	set: mock((key: string, value: boolean) => {
		storageState.set(key, value)
	}),
	remove: mock((key: string) => {
		storageState.delete(key)
	}),
	getBoolean: mock((key: string) => storageState.get(key))
}

mock.module(`${SRC_ROOT}utils/storage.ts`, () => ({
	appStorage: appStorageMock,
	loadSecureAsync: async () => null,
	saveSecureAsync: async () => {},
	deleteSecure: () => {}
}))

let officeTogglePending: typeof import('../office-toggle-pending')

beforeAll(async () => {
	officeTogglePending = await import('../office-toggle-pending')
})

describe('office-toggle-pending', () => {
	beforeEach(() => {
		storageState.clear()
		appStorageMock.set.mockClear()
		appStorageMock.remove.mockClear()
		appStorageMock.getBoolean.mockClear()
	})

	it('setOfficeTogglePending - Should store true when pending', () => {
		officeTogglePending.setOfficeTogglePending(true)

		expect(appStorageMock.set).toHaveBeenCalledWith(
			'office-toggle-pending',
			true
		)
		expect(officeTogglePending.isOfficeTogglePending()).toBe(true)
	})

	it('setOfficeTogglePending - Should remove the key when clearing', () => {
		officeTogglePending.setOfficeTogglePending(true)
		officeTogglePending.setOfficeTogglePending(false)

		expect(appStorageMock.remove).toHaveBeenCalledWith('office-toggle-pending')
		expect(officeTogglePending.isOfficeTogglePending()).toBe(false)
	})

	it('isOfficeTogglePending - Should default to false when unset', () => {
		expect(officeTogglePending.isOfficeTogglePending()).toBe(false)
	})

	it('consumeOfficeTogglePending - Should clear and return the pending flag', () => {
		officeTogglePending.setOfficeTogglePending(true)

		expect(officeTogglePending.consumeOfficeTogglePending()).toBe(true)
		expect(appStorageMock.remove).toHaveBeenCalledWith('office-toggle-pending')
		expect(officeTogglePending.consumeOfficeTogglePending()).toBe(false)
	})
})
