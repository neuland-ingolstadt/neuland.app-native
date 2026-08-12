import React, { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { MapContext } from '@/contexts/map'
import type { SearchResult, SelectMapElement } from '@/types/map'
import Divider from '../Universal/divider'
import { SearchHistoryItem } from './search-history-item'

interface SearchHistoryProps {
	selectMapElement: SelectMapElement
}

const SearchHistory = ({
	selectMapElement
}: SearchHistoryProps): React.JSX.Element => {
	const { t } = useTranslation('common')
	const { searchHistory, updateSearchHistory } = use(MapContext)

	function addToSearchHistory(newHistory: SearchResult): void {
		const newSearchHistory = searchHistory.filter(
			(history) => history.title !== newHistory.title
		)

		newSearchHistory.unshift(newHistory)

		if (newSearchHistory.length > 5) {
			newSearchHistory.length = 5
		}

		updateSearchHistory(newSearchHistory)
	}

	function deleteSearchHistoryItem(element: SearchResult): void {
		const newSearchHistory = searchHistory.filter(
			(history) => history.title !== element.title
		)
		updateSearchHistory(newSearchHistory)
	}
	return (
		<View className="mb-2.5">
			<View className="items-end flex-row justify-between mb-1">
				<Text className="text-text text-label-secondary ios:text-base ios:font-semibold android:text-[13px] android:font-normal android:uppercase web:text-base web:font-semibold mb-0.5 pt-2 text-left">
					{t('pages.map.details.room.history')}
				</Text>
			</View>
			<View className="ios:rounded-2xl android:rounded-lg web:rounded-lg overflow-hidden">
				{searchHistory?.map((history, index) => (
					<React.Fragment key={history.title}>
						<SearchHistoryItem
							history={history}
							selectMapElement={selectMapElement}
							onSelect={addToSearchHistory}
							onDelete={deleteSearchHistoryItem}
						/>
						{index !== searchHistory.length - 1 && (
							<Divider key={`divider-${history.title}`} />
						)}
					</React.Fragment>
				))}
			</View>
		</View>
	)
}

export default SearchHistory
