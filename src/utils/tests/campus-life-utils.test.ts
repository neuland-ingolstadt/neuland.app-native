import { describe, expect, it } from 'bun:test'
import {
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION,
	CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
} from '@/types/campus-life'
import {
	campusLifeEventWebShareUrl,
	campusLifeOrganiserParams,
	parseApiOrganizerKind,
	parseCampusLifeOrganizerKindParam,
	resolveEventOrganizerKind
} from '@/utils/campus-life-utils'

describe('campus-life-utils', () => {
	it('parseApiOrganizerKind - Should accept known organizer kinds', () => {
		expect(parseApiOrganizerKind('THI_DEPARTMENT')).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
		)
		expect(parseApiOrganizerKind('STUDENT_ASSOCIATION')).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
		)
	})

	it('parseApiOrganizerKind - Should reject unknown values', () => {
		expect(parseApiOrganizerKind('UNKNOWN')).toBeUndefined()
		expect(parseApiOrganizerKind(null)).toBeUndefined()
	})

	it('parseCampusLifeOrganizerKindParam - Should default to student associations', () => {
		expect(parseCampusLifeOrganizerKindParam(undefined)).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
		)
		expect(parseCampusLifeOrganizerKindParam('invalid')).toBe(
			CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
		)
	})

	it('resolveEventOrganizerKind - Should prefer API organizer kind', () => {
		expect(
			resolveEventOrganizerKind(
				{
					organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
				},
				undefined
			)
		).toBe(CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT)

		expect(
			resolveEventOrganizerKind(
				{
					organizerKind: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
				},
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
			)
		).toBe(CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION)
	})

	it('campusLifeEventWebShareUrl - Should include org for THI events', () => {
		expect(
			campusLifeEventWebShareUrl(
				'42',
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
			)
		).toBe('https://web.neuland.app/events/cl/42?org=THI_DEPARTMENT')

		expect(
			campusLifeEventWebShareUrl(
				'42',
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
			)
		).toBe('https://web.neuland.app/events/cl/42')
	})

	it('campusLifeOrganiserParams - Should include org for THI departments', () => {
		expect(
			campusLifeOrganiserParams(
				7,
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
			)
		).toEqual({
			id: '7',
			org: CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_THI_DEPARTMENT
		})

		expect(
			campusLifeOrganiserParams(
				7,
				CAMPUS_LIFE_PUBLIC_ORGANIZER_KIND_STUDENT_ASSOCIATION
			)
		).toEqual({ id: '7' })
	})
})
