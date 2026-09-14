import { describe, expect, it } from 'bun:test'
import {
	normalizeLecturers,
	parseLecturerIds,
	resolveLecturerLinks
} from '../lecturers-utils'

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
			{
				name: 'Mustermann',
				vorname: 'Max',
				tel_dienst: '0841 / 9348 - 100',
				raum: 'G 123'
			},
			{
				name: 'Dummy',
				vorname: null,
				tel_dienst: '0841 / 9348 - 200',
				raum: 'A 001'
			}
		] as never

		const result = normalizeLecturers(entries)
		expect(result).toHaveLength(1)
		expect(result[0].name).toBe('Mustermann')
	})

	it('normalizeLecturers - Should normalize THI phone numbers to international format', () => {
		const entries = [
			{
				name: 'Mustermann',
				vorname: 'Max',
				tel_dienst: '0841 / 9348 - 100',
				raum: 'G 123'
			}
		] as never

		const result = normalizeLecturers(entries)
		expect(result[0].tel_dienst).toBe('+49 841 9348100')
	})

	it('normalizeLecturers - Should normalize room and expose room_short', () => {
		const entries = [
			{
				name: 'Mustermann',
				vorname: 'Max',
				tel_dienst: '0841 / 9348 - 100',
				raum: 'G 123 (Bureau)'
			}
		] as never

		const result = normalizeLecturers(entries)
		expect(result[0].room_short).toBe('G123')
	})

	it('normalizeLecturers - Should sort normalized lecturers by last name', () => {
		const entries = [
			{
				name: 'Zeta',
				vorname: 'Zoe',
				tel_dienst: '0841 / 9348 - 200',
				raum: 'A 200'
			},
			{
				name: 'Alpha',
				vorname: 'Anna',
				tel_dienst: '0841 / 9348 - 100',
				raum: 'A 100'
			}
		] as never

		const result = normalizeLecturers(entries)
		expect(result.map((entry) => entry.name)).toEqual(['Alpha', 'Zeta'])
	})
})
