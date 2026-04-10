import { describe, expect, it } from 'bun:test'
import {
	arraysEqual,
	capitalizeFirstLetter,
	convertToMajorMinorPatch,
	lowercaseFirstLetter
} from '../app-utils'

describe('app-utils', () => {
	it('convertToMajorMinorPatch - Should keep major and minor from a semantic version', () => {
		expect(convertToMajorMinorPatch('1.2.3')).toBe('1.2')
	})

	it('convertToMajorMinorPatch - Should keep available parts when patch is missing', () => {
		expect(convertToMajorMinorPatch('1.2')).toBe('1.2')
	})

	it('capitalizeFirstLetter - Should uppercase the first letter of a lowercase string', () => {
		expect(capitalizeFirstLetter('neuland')).toBe('Neuland')
	})

	it('capitalizeFirstLetter - Should return an empty string unchanged', () => {
		expect(capitalizeFirstLetter('')).toBe('')
	})

	it('lowercaseFirstLetter - Should lowercase the first letter of an uppercase string', () => {
		expect(lowercaseFirstLetter('Neuland')).toBe('neuland')
	})

	it('lowercaseFirstLetter - Should return an empty string unchanged', () => {
		expect(lowercaseFirstLetter('')).toBe('')
	})

	it('arraysEqual - Should return true for arrays with equal values and order', () => {
		expect(arraysEqual([1, 'a', true], [1, 'a', true])).toBe(true)
	})

	it('arraysEqual - Should return false for arrays with different lengths', () => {
		expect(arraysEqual([1, 2], [1, 2, 3])).toBe(false)
	})

	it('arraysEqual - Should return false for arrays with equal values in different order', () => {
		expect(arraysEqual([1, 2, 3], [3, 2, 1])).toBe(false)
	})
})
