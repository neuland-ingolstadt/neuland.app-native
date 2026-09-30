import { describe, expect, it } from 'bun:test'
import {
	normalizeLecturers,
	parseLecturerIds,
	resolveLecturerLinks
} from '../lecturers-utils'

const lecturer = (
	overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
	name: 'Mustermann',
	vorname: 'Max',
	tel_dienst: '0841 / 9348 - 100',
	raum: 'G 123',
	...overrides
})

describe('lecturers-utils', () => {
	it('parseLecturerIds - Should parse single and multiple ids', () => {
		expect(parseLecturerIds('abc123')).toEqual(['abc123'])
		expect(parseLecturerIds('id1, id2')).toEqual(['id1', 'id2'])
		expect(parseLecturerIds(12345)).toEqual(['12345'])
		expect(parseLecturerIds(null)).toEqual([])
		expect(parseLecturerIds('')).toEqual([])
		expect(parseLecturerIds('  ')).toEqual([])
	})

	it('resolveLecturerLinks - Should keep THI lastname and initial as one label', () => {
		const lecturers = [
			{ id: '1337', name: 'Georges', vorname: 'Marie' }
		] as never

		expect(resolveLecturerLinks('Georges, M.', ['76229'], lecturers)).toEqual([
			{ name: 'Georges, M.', lecturer: lecturers[0] }
		])
	})

	it('resolveLecturerLinks - Should pair multiple lecturers by index', () => {
		const lecturers = [
			{ id: 'id1', name: 'X', vorname: 'A' },
			{ id: 'id2', name: 'Y', vorname: 'B' }
		] as never

		expect(
			resolveLecturerLinks('Prof. X, Prof. Y', ['id1', 'id2'], lecturers)
		).toEqual([
			{ name: 'Prof. X', lecturer: lecturers[0] },
			{ name: 'Prof. Y', lecturer: lecturers[1] }
		])
	})

	it('resolveLecturerLinks - Should match by last name and initial', () => {
		const lecturers = [
			{ id: '1', name: 'Georges', vorname: 'Marie' },
			{ id: '2', name: 'Georges', vorname: 'Anna' }
		] as never

		expect(
			resolveLecturerLinks('Georges, M.', [], lecturers)[0]?.lecturer?.id
		).toBe('1')
		expect(
			resolveLecturerLinks('Georges, X.', [], lecturers)[0]?.lecturer
		).toBeUndefined()
	})

	it('resolveLecturerLinks - Should match unique last name when initial mismatches', () => {
		const lecturers = [
			{ id: '9', name: 'Georges', vorname: 'Alexandra' }
		] as never

		expect(
			resolveLecturerLinks('Georges, M.', [], lecturers)[0]?.lecturer?.id
		).toBe('9')
	})

	it('resolveLecturerLinks - Should search fallback sources in order', () => {
		const primary = [{ id: 'a', name: 'Alpha', vorname: 'A' }] as never
		const fallback = [{ id: 'b', name: 'Beta', vorname: 'B' }] as never

		expect(
			resolveLecturerLinks('Beta', ['b'], primary, fallback)[0]?.lecturer?.name
		).toBe('Beta')
	})

	it('resolveLecturerLinks - Should match plain last names without THI initial format', () => {
		const lecturers = [{ id: '1', name: 'Muster', vorname: 'Max' }] as never

		expect(resolveLecturerLinks('Muster', [], lecturers)[0]?.lecturer?.id).toBe(
			'1'
		)
	})

	it('resolveLecturerLinks - Should resolve lecturer by id when name does not match', () => {
		const lecturers = [{ id: 'abc', name: 'Smith', vorname: 'John' }] as never

		expect(
			resolveLecturerLinks('Unknown Name', ['abc'], lecturers)[0]?.lecturer?.id
		).toBe('abc')
	})

	it('normalizeLecturers - Should remove dummy entries without first name', () => {
		const entries = [
			lecturer(),
			lecturer({
				name: 'Dummy',
				vorname: null,
				tel_dienst: '0841 / 9348 - 200'
			})
		] as never

		const result = normalizeLecturers(entries)
		expect(result).toHaveLength(1)
		expect(result[0].name).toBe('Mustermann')
	})

	it('normalizeLecturers - Should trim and normalize THI phone numbers', () => {
		const entries = [lecturer({ tel_dienst: '  0841 / 9348 - 100  ' })] as never

		const result = normalizeLecturers(entries)
		expect(result[0].tel_dienst).toBe('+49 841 9348100')
	})

	it('normalizeLecturers - Should strip (0) from international-style numbers', () => {
		const entries = [lecturer({ tel_dienst: '+49 (0) 841 9348 100' })] as never

		expect(normalizeLecturers(entries)[0].tel_dienst).toBe('+49 841 9348100')
	})

	it('normalizeLecturers - Should expand suffix-only and 9348-prefixed numbers', () => {
		expect(
			normalizeLecturers([lecturer({ tel_dienst: '100' })] as never)[0]
				.tel_dienst
		).toBe('+49 841 9348100')
		expect(
			normalizeLecturers([lecturer({ tel_dienst: '-1234' })] as never)[0]
				.tel_dienst
		).toBe('+49 841 93481234')
		expect(
			normalizeLecturers([lecturer({ tel_dienst: '9348123' })] as never)[0]
				.tel_dienst
		).toBe('+49 841 9348123')
	})

	it('normalizeLecturers - Should fix bare 49 country codes and spaced 0841 prefixes', () => {
		expect(
			normalizeLecturers([
				lecturer({ tel_dienst: '49 841 9348100' })
			] as never)[0].tel_dienst
		).toBe('+49 841 9348100')
		expect(
			normalizeLecturers([
				lecturer({ tel_dienst: '0 841 9348100' })
			] as never)[0].tel_dienst
		).toBe('+49 841 9348100')
		expect(
			normalizeLecturers([
				lecturer({ tel_dienst: '+ 49 841 9348100' })
			] as never)[0].tel_dienst
		).toBe('+49 841 9348100')
	})

	it('normalizeLecturers - Should collapse separators between digits and slashes', () => {
		expect(
			normalizeLecturers([
				lecturer({ tel_dienst: '0841-9348/100' })
			] as never)[0].tel_dienst
		).toBe('+49 841 9348100')
		expect(
			normalizeLecturers([
				lecturer({ tel_dienst: '0841(9348)100' })
			] as never)[0].tel_dienst
		).toBe('+49 841 9348100')
	})

	it('normalizeLecturers - Should normalize room_short across spacing variants', () => {
		expect(
			normalizeLecturers([lecturer({ raum: 'G 123 (Bureau)' })] as never)[0]
				.room_short
		).toBe('G123')
		expect(
			normalizeLecturers([lecturer({ raum: 'G123' })] as never)[0].room_short
		).toBe('G123')
		expect(
			normalizeLecturers([lecturer({ raum: 'G   12' })] as never)[0].room_short
		).toBe('G12')
	})

	it('normalizeLecturers - Should fall back to empty room_short when raum is missing', () => {
		expect(
			normalizeLecturers([lecturer({ raum: null })] as never)[0].room_short
		).toBe('')
		expect(
			normalizeLecturers([lecturer({ raum: undefined })] as never)[0].room_short
		).toBe('')
		expect(
			normalizeLecturers([lecturer({ raum: 'Büro' })] as never)[0].room_short
		).toBe('')
	})

	it('normalizeLecturers - Should sort normalized lecturers by last name', () => {
		const entries = [
			lecturer({
				name: 'Zeta',
				vorname: 'Zoe',
				tel_dienst: '0841 / 9348 - 200'
			}),
			lecturer({
				name: 'Alpha',
				vorname: 'Anna',
				tel_dienst: '0841 / 9348 - 100'
			})
		] as never

		const result = normalizeLecturers(entries)
		expect(result.map((entry) => entry.name)).toEqual(['Alpha', 'Zeta'])
	})
})
