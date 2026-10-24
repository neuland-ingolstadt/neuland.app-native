import { describe, expect, it } from 'bun:test'
import type { SearchResult } from '@/types/map'
import {
	MAX_SEARCH_HISTORY_LENGTH,
	pushSearchHistory,
	removeSearchHistoryItem
} from '../map-search-history'

function entry(title: string): SearchResult {
	return {
		title,
		subtitle: title,
		item: { type: 'Feature', properties: { Raum: title } } as never
	}
}

describe('map-search-history', () => {
	it('prepends entries and dedupes by title', () => {
		const history = [entry('G101'), entry('G102')]
		const next = pushSearchHistory(history, entry('G102'))
		expect(next.map((item) => item.title)).toEqual(['G102', 'G101'])
	})

	it('caps history at the max length', () => {
		const history = Array.from(
			{ length: MAX_SEARCH_HISTORY_LENGTH },
			(_, index) => entry(`G10${index}`)
		)
		const next = pushSearchHistory(history, entry('G200'))
		expect(next).toHaveLength(MAX_SEARCH_HISTORY_LENGTH)
		expect(next[0].title).toBe('G200')
	})

	it('removes entries by title', () => {
		const history = [entry('G101'), entry('G102')]
		expect(
			removeSearchHistoryItem(history, entry('G101')).map((item) => item.title)
		).toEqual(['G102'])
	})
})
