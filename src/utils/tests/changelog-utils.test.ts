import { describe, expect, it } from 'bun:test'
import type { Changelog, Version } from '@/types/data'
import { validateAppVersionHasChangelogEntries } from '../changelog-utils'

const sampleEntry = {
	title: { de: 'Titel', en: 'Title' },
	description: { de: 'Beschreibung', en: 'Description' },
	icon: { ios: 'star', android: 'star', web: 'Star' }
} satisfies Version

describe('validateAppVersionHasChangelogEntries', () => {
	it('accepts a matching major.minor key with at least one entry', () => {
		const changelog: Changelog = {
			version: {
				'0.16': [sampleEntry]
			}
		}

		expect(validateAppVersionHasChangelogEntries('0.16.0', changelog)).toEqual({
			ok: true,
			key: '0.16',
			count: 1
		})
	})

	it('maps patch releases to the major.minor changelog key', () => {
		const changelog: Changelog = {
			version: {
				'1.2': [sampleEntry, sampleEntry]
			}
		}

		expect(validateAppVersionHasChangelogEntries('1.2.9', changelog)).toEqual({
			ok: true,
			key: '1.2',
			count: 2
		})
	})

	it('rejects a missing changelog key', () => {
		const changelog: Changelog = {
			version: {
				'0.15': [sampleEntry]
			}
		}

		expect(validateAppVersionHasChangelogEntries('0.16.0', changelog)).toEqual({
			ok: false,
			key: '0.16',
			reason: 'no changelog key "0.16" for app version 0.16.0'
		})
	})

	it('rejects an empty changelog entry list', () => {
		const changelog: Changelog = {
			version: {
				'0.16': []
			}
		}

		expect(validateAppVersionHasChangelogEntries('0.16.0', changelog)).toEqual({
			ok: false,
			key: '0.16',
			reason: 'changelog key "0.16" has no entries'
		})
	})
})
