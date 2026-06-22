import { selectionAsync } from 'expo-haptics'
import React, { use } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutAnimation, Platform, Pressable, Text, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { useCSSVariable } from 'uniwind'
import { MapContext } from '@/contexts/map'
import type { SearchResult } from '@/types/map'
import { toColor } from '@/utils/uniwind-utils'

import Divider from '../Universal/Divider'
import PlatformIcon from '../Universal/Icon'
import ResultRow from './search-result-row'

interface SearchHistoryProps {
	handlePresentModalPress: () => void
}

const SearchHistory = ({
	handlePresentModalPress
}: SearchHistoryProps): React.JSX.Element => {
	const notificationColor = useCSSVariable('--color-notification') as
		| string
		| undefined
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
				<Text className="text-text text-xl font-semibold mb-0.5 pt-2 text-left">
					{t('pages.map.details.room.history')}
				</Text>
			</View>
			<View className="rounded-2xl overflow-hidden">
				{searchHistory?.map((history, index) => (
					<React.Fragment key={history.title}>
						<Swipeable
							renderRightActions={() => (
								<Pressable
									className="items-center justify-center w-[70px]"
									onPress={() => {
										LayoutAnimation.configureNext(
											LayoutAnimation.Presets.easeInEaseOut
										)
										if (Platform.OS === 'ios') {
											void selectionAsync()
										}
										deleteSearchHistoryItem(history)
									}}
								>
									<PlatformIcon
										ios={{
											name: 'trash',
											size: 20
										}}
										android={{
											name: 'delete',
											size: 24
										}}
										web={{
											name: 'Trash',
											size: 24
										}}
										style={{ color: toColor(notificationColor) }}
									/>
								</Pressable>
							)}
						>
							<View className="bg-card px-3 py-[3px] w-full">
								<ResultRow
									result={history}
									index={index}
									handlePresentModalPress={handlePresentModalPress}
									updateSearchHistory={addToSearchHistory}
								/>
							</View>
						</Swipeable>
						{index !== searchHistory.length - 1 && (
							<Divider key={`divider-${index}`} />
						)}
					</React.Fragment>
				))}
			</View>
		</View>
	)
}

export default SearchHistory
