import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from '../Universal/icon'

const AttributionLink = (): React.JSX.Element => {
	const { t } = useTranslation('common')
	const labelColor = toColor(useCSSVariable('--color-label'))

	return (
		<View className="py-10">
			<Pressable
				onPress={() => {
					void Linking.openURL('https://www.openstreetmap.org/copyright')
				}}
				className="items-center flex-row gap-1"
			>
				<Text className="text-[15px] ps-1" style={{ color: labelColor }}>
					{t('pages.map.details.osm')}
				</Text>
				<PlatformIcon
					ios={{
						name: 'chevron.forward',
						size: 6
					}}
					android={{
						name: 'chevron_right',
						size: 16
					}}
					web={{
						name: 'ChevronRight',
						size: 16
					}}
					style={{ color: labelColor }}
				/>
			</Pressable>
		</View>
	)
}

export default AttributionLink
