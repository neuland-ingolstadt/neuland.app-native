import { appStorage } from '@/utils/storage'

const OFFICE_TOGGLE_PENDING_KEY = 'office-toggle-pending'

export function setOfficeTogglePending(pending: boolean): void {
	if (pending) {
		appStorage.set(OFFICE_TOGGLE_PENDING_KEY, true)
	} else {
		appStorage.remove(OFFICE_TOGGLE_PENDING_KEY)
	}
}

export function isOfficeTogglePending(): boolean {
	return appStorage.getBoolean(OFFICE_TOGGLE_PENDING_KEY) ?? false
}

export function consumeOfficeTogglePending(): boolean {
	const pending = appStorage.getBoolean(OFFICE_TOGGLE_PENDING_KEY)
	if (pending) {
		appStorage.remove(OFFICE_TOGGLE_PENDING_KEY)
	}
	return pending ?? false
}
