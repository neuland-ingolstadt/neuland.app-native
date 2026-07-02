import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { StyledBottomSheetView } from '@/components/Universal/styled'

export const HomeBottomSheet = (): React.JSX.Element => {
	const { t } = useTranslation('common')
	return (
		<StyledBottomSheetView className="flex-1 px-page">
			<View>
				<Text className="text-text text-[21px] font-bold">
					{t('reportProblem')}
				</Text>
			</View>
		</StyledBottomSheetView>
	)
}
