import { describe, expect, it } from 'bun:test'
import { filterMemberIdGroups, memberGroupSlug } from '@/utils/member-id-groups'

describe('memberGroupSlug', () => {
	it('uses the last path segment', () => {
		expect(memberGroupSlug('neuland/Vorstand')).toBe('vorstand')
	})

	it('lowercases the slug', () => {
		expect(memberGroupSlug('Design-Marketing')).toBe('design-marketing')
	})
})

describe('filterMemberIdGroups', () => {
	it('keeps only whitelisted teams in display order', () => {
		expect(
			filterMemberIdGroups([
				'engineering',
				'authentik Admins',
				'events',
				'vorstand',
				'random'
			])
		).toEqual(['vorstand', 'events', 'engineering'])
	})

	it('returns an empty list when nothing matches', () => {
		expect(filterMemberIdGroups(['authentik Admins', 'ehrenmitglied'])).toEqual(
			[]
		)
	})

	it('returns an empty list for missing or empty groups', () => {
		expect(filterMemberIdGroups(undefined)).toEqual([])
		expect(filterMemberIdGroups([])).toEqual([])
	})
})
