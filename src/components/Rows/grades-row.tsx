import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import type { Grade } from '@/types/thi-api'

import RowEntry from '../Universal/row-entry'

const GradesRow = ({ item }: { item: Grade }): React.JSX.Element => {
	const { t } = useTranslation('settings')
	if (item.titel === null || item.titel === '') {
		// biome-ignore lint/complexity/noUselessFragments: we need to return something
		return <></>
	}

	return (
		<RowEntry
			title={item.titel}
			leftChildren={
				<View className="pt-[3px]">
					<Text
						className="mb-1 text-[15px] font-medium text-label"
						numberOfLines={2}
					>
						{'ECTS: '}
						{item.ects ?? t('grades.none')}
					</Text>
				</View>
			}
			rightChildren={
				<View className="flex-col items-end justify-end">
					{item.note !== null && item.note !== '' && (
						<View className="flex-col items-end gap-[5px]">
							<Text className="text-xl font-medium text-label">
								{item.note}
							</Text>
							<Text className="text-sm text-label-secondary">
								{t('grades.grade')}
							</Text>
						</View>
					)}
				</View>
			}
		/>
	)
}

export default GradesRow
