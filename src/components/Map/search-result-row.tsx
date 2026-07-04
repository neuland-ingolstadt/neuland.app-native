import { trackEvent } from '@aptabase/react-native'
import type { Position } from 'geojson'
import type React from 'react'
import { memo, use } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { StyledBottomSheetTouchableOpacity } from '@/components/Universal/styled'
import { MapContext } from '@/contexts/map'
import type { SEARCH_TYPES, SearchResult } from '@/types/map'
import type { MaterialIcon } from '@/types/material-icons'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

import PlatformIcon from '../Universal/icon'

interface ResultRowProps {
	result: SearchResult
	handlePresentModalPress: () => void
	updateSearchHistory: (result: SearchResult) => void
}

const ResultRow = ({
	result,
	handlePresentModalPress,
	updateSearchHistory
}: ResultRowProps): React.JSX.Element => {
	const { setClickedElement, setLocalSearch, setCurrentFloor } = use(MapContext)
	const { i18n } = useTranslation()
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const iconColor = getContrastColor(primaryColor)
	const roomTypeKey = i18n.language === 'de' ? 'Funktion_de' : 'Funktion_en'
	return (
		<StyledBottomSheetTouchableOpacity
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
