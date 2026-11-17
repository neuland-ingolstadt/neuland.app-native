import { describe, expect, it } from 'bun:test'
import {
	createFeedbackId,
	getFeedbackCategories,
	getFeedbackFollowUp,
	parseFeedbackRating,
	shuffled,
	toOptionalText
} from '../feedback-utils'

describe('getFeedbackFollowUp', () => {
	it('asks for improvements up to a neutral rating', () => {
		expect(getFeedbackFollowUp(1)).toBe('improvements')
		expect(getFeedbackFollowUp(3)).toBe('improvements')
	})

	it('asks for highlights from a good rating on', () => {
		expect(getFeedbackFollowUp(4)).toBe('highlights')
		expect(getFeedbackFollowUp(5)).toBe('highlights')
	})
})

describe('getFeedbackCategories', () => {
	it('returns problem categories for low ratings', () => {
		expect(getFeedbackCategories(2)).toContain('bugs')
		expect(getFeedbackCategories(2)).not.toContain('timetable')
	})

	it('returns feature categories for high ratings', () => {
		expect(getFeedbackCategories(5)).toContain('timetable')
		expect(getFeedbackCategories(5)).not.toContain('bugs')
	})
})

describe('parseFeedbackRating', () => {
	it('parses valid ratings', () => {
		expect(parseFeedbackRating('1')).toBe(1)
		expect(parseFeedbackRating('5')).toBe(5)
	})

	it('rejects invalid values', () => {
		expect(parseFeedbackRating(undefined)).toBeUndefined()
		expect(parseFeedbackRating('')).toBeUndefined()
		expect(parseFeedbackRating('0')).toBeUndefined()
		expect(parseFeedbackRating('6')).toBeUndefined()
		expect(parseFeedbackRating('2.5')).toBeUndefined()
		expect(parseFeedbackRating('abc')).toBeUndefined()
	})
})

describe('createFeedbackId', () => {
	it('creates distinct ids', () => {
		const ids = new Set(Array.from({ length: 100 }, () => createFeedbackId()))
		expect(ids.size).toBe(100)
	})
})

describe('shuffled', () => {
	it('keeps every item and leaves the input untouched', () => {
		const input = ['a', 'b', 'c', 'd'] as const
		const result = shuffled(input)
		expect([...result].sort()).toEqual(['a', 'b', 'c', 'd'])
		expect(input).toEqual(['a', 'b', 'c', 'd'])
	})

	it('reorders items based on the random source', () => {
		expect(shuffled(['a', 'b', 'c'], () => 0)).toEqual(['b', 'c', 'a'])
		expect(shuffled(['a', 'b', 'c'], () => 0.99)).toEqual(['a', 'b', 'c'])
	})
})

describe('toOptionalText', () => {
	it('trims text and drops empty input', () => {
		expect(toOptionalText('  hello  ')).toBe('hello')
		expect(toOptionalText('   ')).toBeUndefined()
		expect(toOptionalText('')).toBeUndefined()
	})
})
