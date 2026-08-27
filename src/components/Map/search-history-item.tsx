import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { LayoutAnimation, Platform, Pressable, View } from 'react-native'
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable'
import { useCSSVariable } from 'uniwind'
import type { SearchResult, SelectMapElement } from '@/types/map'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from '../Universal/icon'
import ResultRow from './search-result-row'

interface SearchHistoryItemProps {
	history: SearchResult
	selectMapElement: SelectMapElement
	onSelect: (result: SearchResult) => void
	onDelete: (result: SearchResult) => void
	onClearSearch: () => void
}

export const SearchHistoryItem = ({
	history,
	selectMapElement,
	onSelect,
	onDelete,
	onClearSearch
}: SearchHistoryItemProps): React.JSX.Element => {
	const notificationColor = toColor(useCSSVariable('--color-notification'))

	return (
		<Swipeable
			renderRightActions={() => (
				<Pressable
					className="items-center justify-center w-[70px]"
					onPress={() => {
						LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
						if (Platform.OS === 'ios') {
							void selectionAsync()
						}
						onDelete(history)
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
						style={{ color: notificationColor }}
					/>
				</Pressable>
			)}
		>
			<View className="bg-card px-3 py-[3px] w-full">
				<ResultRow
					result={history}
					selectMapElement={selectMapElement}
					updateSearchHistory={onSelect}
					onClearSearch={onClearSearch}
				/>
			</View>
		</Swipeable>
	)
}
