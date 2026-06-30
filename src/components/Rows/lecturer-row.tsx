import { type RelativePathString, router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { NormalizedLecturer } from '@/types/utils'
import { toColor } from '@/utils/uniwind-utils'

import RowEntry from '../Universal/row-entry'

const LecturerRow = ({
	item
}: {
	item: NormalizedLecturer
}): React.JSX.Element => {
	const cardColor = useCSSVariable('--color-card')
	const setSelectedLecturer = useRouteParamsStore(
		(state) => state.setSelectedLecturer
	)
	const onPressRoom = (): void => {
		if (item.room_short) {
			router.dismiss()
			router.push({
				pathname: '/map',
				params: { room: item.room_short }
			})
		}
	}
	const onPressRow = (): void => {
		setSelectedLecturer(item)
	}

	const { t } = useTranslation('api')
	return (
		<RowEntry
			href={'/lecturer' as RelativePathString}
			title={`${[item.titel, item.vorname, item.name].join(' ').trim()}`}
			leftChildren={
				<>
					<Text
						className="mb-1 text-[15px] font-medium text-label"
						numberOfLines={2}
					>
						{t(`lecturerFunctions.${item?.funktion}`, {
							defaultValue: item?.funktion,
							fallbackLng: 'de'
						})}
					</Text>
					<Text className="text-[13px] text-label" numberOfLines={2}>
						{item?.organisation !== null &&
							t(`lecturerOrganizations.${item?.organisation}`, {
								defaultValue: item?.organisation,
								fallbackLng: 'de'
							})}
					</Text>
				</>
			}
			rightChildren={
				<View className="flex-col items-end justify-end">
					{item.room_short !== null && item.room_short !== '' && (
						<View className="flex-row">
							<Text className="text-sm text-label">
								{t('pages.lecturer.contact.room', {
									ns: 'common'
								})}
								{': '}
							</Text>
							<Text className="text-sm text-primary" onPress={onPressRoom}>
								{item.room_short}
							</Text>
						</View>
					)}
				</View>
			}
			backgroundColor={toColor(cardColor) as string | undefined}
			onPress={onPressRow}
		/>
	)
}

export default LecturerRow
