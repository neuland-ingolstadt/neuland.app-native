import { trackEvent } from '@aptabase/react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import type { Position } from 'geojson'
import type React from 'react'
import { memo, use } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { MapContext } from '@/contexts/map'
import type { SEARCH_TYPES, SearchResult } from '@/types/map'
import type { MaterialIcon } from '@/types/material-icons'
import { getContrastColor } from '@/utils/ui-utils'

import PlatformIcon from '../Universal/Icon'

interface ResultRowProps {
	result: SearchResult
	index: number
	handlePresentModalPress: () => void
	updateSearchHistory: (result: SearchResult) => void
}

const ResultRow = ({
	result,
	index,
	handlePresentModalPress,
	updateSearchHistory
}: ResultRowProps): React.JSX.Element => {
	const { setClickedElement, setLocalSearch, setCurrentFloor } = use(MapContext)
	const primaryColor = useCSSVariable('--color-primary') as string
	const { i18n } = useTranslation()
	const roomTypeKey = i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en'
	return (
		<TouchableOpacity
			key={index}
			className="items-center flex-row py-2.5"
			onPress={() => {
				const center = result.item.properties?.center as Position | undefined
				updateSearchHistory(result)
				setClickedElement({
					data: result.title,
					type: result.item.properties?.rtype as SEARCH_TYPES,
					center,
					manual: false
				})
				setCurrentFloor({
					floor: (result.item.properties?.Ebene as string) ?? 'EG',
					manual: false
				})
				trackEvent('Room', {
					room: result.title,
					origin: 'Search'
				})
				handlePresentModalPress()
				setLocalSearch('')
			}}
		>
			<View className="items-center bg-primary rounded-infinite h-10 justify-center mr-3.5 w-10">
				<PlatformIcon
					ios={{
						name: result.item.properties?.icon.ios as string,
						size: 18
					}}
					android={{
						name: result.item.properties?.icon.android as MaterialIcon,
						variant: 'outlined',
						size: 21
					}}
					web={{
						name: 'MapPin',
						size: 21
					}}
					style={{ color: getContrastColor(primaryColor) }}
				/>
			</View>

			<View className="flex-1">
				<Text className="text-text text-base font-semibold">
					{result.title}
				</Text>
				<Text className="text-text text-sm font-normal max-w-[90%]">
					{result.item.properties?.[roomTypeKey] ?? result.subtitle}
				</Text>
			</View>
		</TouchableOpacity>
	)
}

export default memo(ResultRow)
