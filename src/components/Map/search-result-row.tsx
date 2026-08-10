import type React from 'react'
import { memo, use } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { StyledBottomSheetTouchableOpacity } from '@/components/Universal/styled'
import { MapContext } from '@/contexts/map'
import type { SEARCH_TYPES, SearchResult, SelectMapElement } from '@/types/map'
import type { MaterialIcon } from '@/types/material-icons'
import { parseMapCoordinate } from '@/utils/map-screen-utils'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

import PlatformIcon from '../Universal/icon'

interface ResultRowProps {
	result: SearchResult
	selectMapElement: SelectMapElement
	updateSearchHistory: (result: SearchResult) => void
}

const ResultRow = ({
	result,
	selectMapElement,
	updateSearchHistory
}: ResultRowProps): React.JSX.Element => {
	const { setLocalSearch } = use(MapContext)
	const { i18n } = useTranslation()
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const iconColor = getContrastColor(primaryColor)
	const roomTypeKey = i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en'
	return (
		<StyledBottomSheetTouchableOpacity
			testID={`map-search-result-${result.title}`}
			className="items-center flex-row py-2.5"
			onPress={() => {
				const center = parseMapCoordinate(result.item.properties?.center)
				updateSearchHistory(result)
				selectMapElement({
					room: result.title,
					type: result.item.properties?.rtype as SEARCH_TYPES,
					center,
					origin: 'Search',
					manual: false,
					floor:
						typeof result.item.properties?.Ebene === 'string'
							? result.item.properties.Ebene
							: 'EG'
				})
				setLocalSearch('')
			}}
		>
			<View
				className="items-center rounded-full h-10 justify-center me-3.5 w-10"
				style={{ backgroundColor: primaryColor }}
			>
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
					style={{ color: iconColor }}
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
		</StyledBottomSheetTouchableOpacity>
	)
}

export default memo(ResultRow)
