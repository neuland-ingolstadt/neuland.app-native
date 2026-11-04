import { beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import {
	appStorageRemoveMock,
	appStorageSetMock,
	resetAppStorage
} from './thi-storage-mocks'

let officeTogglePending: typeof import('../office-toggle-pending')

beforeAll(async () => {
	officeTogglePending = await import('../office-toggle-pending')
})

describe('office-toggle-pending', () => {
	beforeEach(() => {
		resetAppStorage()
	})

	it('setOfficeTogglePending - Should store true when pending', () => {
		officeTogglePending.setOfficeTogglePending(true)

		expect(appStorageSetMock).toHaveBeenCalledWith(
			'office-toggle-pending',
			true
		)
		expect(officeTogglePending.isOfficeTogglePending()).toBe(true)
	})

	it('setOfficeTogglePending - Should remove the key when clearing', () => {
		officeTogglePending.setOfficeTogglePending(true)
		officeTogglePending.setOfficeTogglePending(false)

		expect(appStorageRemoveMock).toHaveBeenCalledWith('office-toggle-pending')
		expect(officeTogglePending.isOfficeTogglePending()).toBe(false)
	})

	it('isOfficeTogglePending - Should default to false when unset', () => {
		expect(officeTogglePending.isOfficeTogglePending()).toBe(false)
	})

	it('consumeOfficeTogglePending - Should clear and return the pending flag', () => {
		officeTogglePending.setOfficeTogglePending(true)

		expect(officeTogglePending.consumeOfficeTogglePending()).toBe(true)
		expect(appStorageRemoveMock).toHaveBeenCalledWith('office-toggle-pending')
		expect(officeTogglePending.consumeOfficeTogglePending()).toBe(false)
	})
})
