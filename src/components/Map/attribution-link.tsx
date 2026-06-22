import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

import PlatformIcon from '../Universal/Icon'

const AttributionLink = (): React.JSX.Element => {
	const labelColor = useCSSVariable('--color-label') as string | undefined
	const { t } = useTranslation('common')

	return (
		<View className="py-10">
			<Pressable
				onPress={() => {
					void Linking.openURL('https://www.openstreetmap.org/copyright')
				}}
				className="items-center flex-row gap-1"
			>
				<Text className="text-label text-[15px] ps-1">
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
					style={{ color: toColor(labelColor) }}
				/>
			</Pressable>
		</View>
	)
}

export default AttributionLink
