import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import { FeedbackButton, StatusButton } from './action-buttons'

export default function StatusBox({
	error,
	crash
}: {
	error: Error
	crash: boolean
}): React.JSX.Element {
	const { t } = useTranslation('common')
	return (
		<View className="items-center gap-[15px] rounded-lg bg-card p-[25px]">
			<Text className="pb-[30px] text-center text-[17px] font-medium text-text">
				{t('error.crash.steps')}
			</Text>
			<FeedbackButton error={error} crash={crash} />
			<StatusButton />
		</View>
	)
}
