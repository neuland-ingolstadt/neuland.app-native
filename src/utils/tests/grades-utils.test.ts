import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test'
import type { SpoWeights } from '@/types/asset-api'
import type { Grade } from '@/types/thi-api'

const SRC_ROOT = new URL('../../', import.meta.url).pathname

const mockGetGrades = mock(async (): Promise<Grade[]> => [])

mock.module(`${SRC_ROOT}api/authenticated-api.ts`, () => ({
	default: {
		getGrades: mockGetGrades
	}
}))

let gradesUtils: typeof import('../grades-utils')

const makeGrade = (overrides: Partial<Grade> = {}): Grade => ({
	stg: 'EI',
	kztn: 'k',
	pon: '1',
	titel: 'Mathematik',
	ects: '5',
	fristsem: 'WS24/25',
	note: '1.3',
	frwpf: '',
	anrech: '',
	...overrides
})

beforeAll(async () => {
	gradesUtils = await import('../grades-utils')
})

describe('grades-utils', () => {
	beforeEach(() => {
		mockGetGrades.mockReset()
		mockGetGrades.mockImplementation(async () => [])
	})
	it('loadGrades - Should return empty finished and missing lists for no grades', async () => {
		mockGetGrades.mockResolvedValueOnce([])

		await expect(gradesUtils.loadGrades()).resolves.toEqual({
			finished: [],
			missing: []
		})
	})

	it('loadGrades - Should normalize empty notes to E* when anrech is asterisk', async () => {
		mockGetGrades.mockResolvedValueOnce([
			makeGrade({ note: '', anrech: '*', titel: 'Praktikum' })
		])

		const { finished } = await gradesUtils.loadGrades()

		expect(finished).toHaveLength(1)
		expect(finished[0].note).toBe('E*')
	})

	it('loadGrades - Should normalize linked empty notes to E when another pon has a grade', async () => {
		mockGetGrades.mockResolvedValueOnce([
			makeGrade({ pon: '42', note: '', titel: 'Projekt A' }),
			makeGrade({ pon: '42', note: '2.0', titel: 'Projekt B' })
		])

		const { finished } = await gradesUtils.loadGrades()

		expect(finished.some((grade) => grade.note === 'E')).toBe(true)
	})

	it('loadGrades - Should keep the duplicate title with the highest ECTS value', async () => {
		mockGetGrades.mockResolvedValueOnce([
			makeGrade({
				pon: '1',
				titel: 'Software Engineering',
				ects: '5',
				note: '2.0'
			}),
			makeGrade({
				pon: '2',
				titel: 'Software Engineering',
				ects: '9',
				note: '1.7'
			}),
			makeGrade({ pon: '3', titel: 'Datenbanken', ects: '5', note: '' })
		])

		const { finished, missing } = await gradesUtils.loadGrades()

		expect(finished).toHaveLength(1)
		expect(finished[0]).toMatchObject({
			titel: 'Software Engineering',
			ects: '9',
			note: '2.0'
		})
		expect(missing).toHaveLength(1)
		expect(missing[0].titel).toBe('Datenbanken')
	})

	it('loadGrades - Should treat grades of 5.0 or higher as missing', async () => {
		mockGetGrades.mockResolvedValueOnce([
			makeGrade({ titel: 'Passed', note: '4.0' }),
			makeGrade({ titel: 'Failed', note: '5.0' })
		])

		const { finished, missing } = await gradesUtils.loadGrades()

		expect(finished.map((grade) => grade.titel)).toEqual(['Passed'])
		expect(missing.map((grade) => grade.titel)).toEqual(['Failed'])
	})

	it('calculateECTS - Should sum ECTS from finished grades', async () => {
		mockGetGrades.mockResolvedValueOnce([
			makeGrade({ pon: '1', titel: 'A', ects: '5', note: '1.0' }),
			makeGrade({ pon: '2', titel: 'B', ects: '7', note: '2.0' }),
			makeGrade({ pon: '3', titel: 'C', ects: '6', note: '' })
		])

		await expect(gradesUtils.calculateECTS()).resolves.toBe(12)
	})

	it('loadGradeAverage - Should throw when SPO data is missing', async () => {
		mockGetGrades.mockResolvedValueOnce([makeGrade()])

		await expect(gradesUtils.loadGradeAverage(null, null)).rejects.toThrow(
			'Failed to load data'
		)
		await expect(
			gradesUtils.loadGradeAverage({ 'SPO 2020': [] }, 'Unknown SPO')
		).rejects.toThrow('Failed to load data')
	})

	it('loadGradeAverage - Should calculate weighted averages from SPO data', async () => {
		mockGetGrades.mockResolvedValueOnce([
			makeGrade({ titel: 'Mathematik I', note: '2.0' }),
			makeGrade({ titel: 'Programmieren', note: '1.5' })
		])

		const courseSPOs: SpoWeights = {
			'Informatik SPO': [
				{
					apo_number: '1',
					name: 'Mathematik I',
					weekly_workload: 4,
					weight: 2,
					ects: 5
				},
				{
					apo_number: '2',
					name: 'Programmieren',
					weekly_workload: 6,
					weight: 3,
					ects: 8
				}
			]
		}

		const average = await gradesUtils.loadGradeAverage(
			courseSPOs,
			'Informatik SPO'
		)

		expect(average.result).toBe(1.7)
		expect(average.entries).toHaveLength(2)
		expect(average.missingWeight).toBe(0)
		expect(average.resultMin).toBeLessThanOrEqual(average.resultMax)
	})

	it('loadGradeAverage - Should count missing weights for unmatched modules', async () => {
		mockGetGrades.mockResolvedValueOnce([
			makeGrade({ titel: 'Unmapped Module', note: '2.0' })
		])

		const courseSPOs: SpoWeights = {
			'Informatik SPO': [
				{
					apo_number: '1',
					name: 'Other Module',
					weekly_workload: 4,
					weight: 2,
					ects: 5
				}
			]
		}

		const average = await gradesUtils.loadGradeAverage(
			courseSPOs,
			'Informatik SPO'
		)

		expect(average.missingWeight).toBe(1)
		expect(average.entries[0]).toMatchObject({
			name: 'Unmapped Module',
			weight: null,
			grade: 2
		})
	})

	it('loadGradeAverage - Should keep the first grade when duplicate SPO names appear', async () => {
		mockGetGrades.mockResolvedValueOnce([
			makeGrade({ titel: 'Mathematik I', note: '2.0' }),
			makeGrade({ titel: 'Mathematik I', note: '1.3' })
		])

		const courseSPOs: SpoWeights = {
			'Informatik SPO': [
				{
					apo_number: '1',
					name: 'Mathematik I',
					weekly_workload: 4,
					weight: 2,
					ects: 5
				}
			]
		}

		const average = await gradesUtils.loadGradeAverage(
			courseSPOs,
			'Informatik SPO'
		)

		expect(average.entries).toHaveLength(1)
		expect(average.entries[0].grade).toBe(2)
	})

	it('loadGradeAverage - Should throw when total weight is zero', async () => {
		mockGetGrades.mockResolvedValueOnce([
			makeGrade({ titel: 'Zero Weight Module', note: '2.0' })
		])

		const courseSPOs: SpoWeights = {
			'Informatik SPO': [
				{
					apo_number: '1',
					name: 'Zero Weight Module',
					weekly_workload: 4,
					weight: 0,
					ects: 5
				}
			]
		}

		await expect(
			gradesUtils.loadGradeAverage(courseSPOs, 'Informatik SPO')
		).rejects.toThrow('Failed to calculate average')
	})
})
