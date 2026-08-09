import { trackEvent } from '@aptabase/react-native'
import type { GeoJsonProperties } from 'geojson'
import { Platform } from 'react-native'
import { SEARCH_TYPES } from '@/types/map'
import type { MaterialIcon } from '@/types/material-icons'
import { copyToClipboard, shareNative } from './ui-utils'

export const handleShareModal = (room: string): void => {
	const payload = `https://web.neuland.app/map/?room=${room}`
	trackEvent('Share', { type: 'room' })
	if (Platform.OS === 'web') {
		void copyToClipboard(payload)
		return
	}

	void shareNative(
		Platform.OS === 'android' ? { message: payload } : { url: payload }
	)
}

export const getIcon = (
	type: SEARCH_TYPES,
	properties?: { result: { item: { properties: GeoJsonProperties } } }
): { ios: string; android: MaterialIcon } => {
	const funktionEn = properties?.result?.item?.properties?.Funktion_en || ''
	const raum = properties?.result?.item?.properties?.Raum || ''
	const food = ['M001', 'X001', 'F001']
	switch (type) {
		case SEARCH_TYPES.BUILDING:
			return { ios: 'building', android: 'corporate_fare' }
		case SEARCH_TYPES.ROOM:
			if (funktionEn.length > 0) {
				if (funktionEn.includes('PC')) {
					return { ios: 'pc', android: 'keyboard' }
				}
				if (funktionEn.includes('Lab')) {
					return { ios: 'flask', android: 'science' }
				}
				if (food.includes(raum)) {
					return { ios: 'fork.knife', android: 'local_cafe' }
				}
				if (funktionEn.includes('Office')) {
					return { ios: 'lamp.desk', android: 'business_center' }
				}
				if (funktionEn.includes('Toilet')) {
					return { ios: 'toilet', android: 'wc' }
				}
				if (funktionEn.includes('Lecture') || funktionEn.includes('Seminar')) {
					return { ios: 'studentdesk', android: 'school' }
				}
				if (funktionEn.includes('Corridor')) {
					return {
						ios: 'arrow.triangle.turn.up.right.diamond',
						android: 'directions'
					}
				}
			}
			return { ios: 'mappin', android: 'location_on' }
		default:
			return { ios: 'mappin', android: 'location_on' }
	}
}
