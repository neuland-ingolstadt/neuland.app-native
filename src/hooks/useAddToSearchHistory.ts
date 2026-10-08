import { use, useCallback } from 'react'
import { MapContext } from '@/contexts/map'
import type { SearchResult } from '@/types/map'
import { pushSearchHistory } from '@/utils/map-search-history'

/** Shared add-to-history callback for search results + history lists. */
export function useAddToSearchHistory(): (entry: SearchResult) => void {
	const { searchHistory, updateSearchHistory } = use(MapContext)
	return useCallback(
		(entry: SearchResult): void => {
			updateSearchHistory(pushSearchHistory(searchHistory, entry))
		},
		[searchHistory, updateSearchHistory]
	)
}
