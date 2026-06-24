import type { Changelog } from '@/types/data'
import { convertToMajorMinorPatch } from '@/utils/app-utils'

export interface ChangelogValidationSuccess {
	ok: true
	key: string
	count: number
}

export interface ChangelogValidationFailure {
	ok: false
	key: string
	reason: string
}

export type ChangelogValidationResult =
	| ChangelogValidationSuccess
	| ChangelogValidationFailure

export function validateAppVersionHasChangelogEntries(
	appVersion: string,
	changelog: Changelog
): ChangelogValidationResult {
	const key = convertToMajorMinorPatch(appVersion)
	const entries = changelog.version[key]

	if (entries === undefined) {
		return {
			ok: false,
			key,
			reason: `no changelog key "${key}" for app version ${appVersion}`
		}
	}

	if (entries.length === 0) {
		return {
			ok: false,
			key,
			reason: `changelog key "${key}" has no entries`
		}
	}

	return { ok: true, key, count: entries.length }
}
