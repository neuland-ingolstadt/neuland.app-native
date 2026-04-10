import { describe, expect, it } from 'bun:test'
import { normalizeLecturers } from '../lecturers-utils'

describe('lecturers-utils', () => {
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
