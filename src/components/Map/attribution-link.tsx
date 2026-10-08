import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { MapChevronLink } from '@/components/Map/map-chevron-link'

const AttributionLink = (): React.JSX.Element => {
	const { t } = useTranslation('common')

	return (
		<MapChevronLink
			label={t('pages.map.details.osm')}
			testID="map-attribution"
			wrapperClassName="py-10"
			onPress={() => {
				void Linking.openURL('https://www.openstreetmap.org/copyright')
			}}
		/>
	)
}

export default AttributionLink
