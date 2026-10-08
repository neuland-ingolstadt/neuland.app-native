import type { SearchResult } from '@/types/map'

export const MAX_SEARCH_HISTORY_LENGTH = 5

export function pushSearchHistory(
	history: SearchResult[],
	entry: SearchResult
): SearchResult[] {
	const next = history.filter((item) => item.title !== entry.title)
	next.unshift(entry)
	if (next.length > MAX_SEARCH_HISTORY_LENGTH) {
		next.length = MAX_SEARCH_HISTORY_LENGTH
	}
	return next
}

export function removeSearchHistoryItem(
	history: SearchResult[],
	entry: SearchResult
): SearchResult[] {
	return history.filter((item) => item.title !== entry.title)
}
