import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'

interface ResetOrderButtonProps {
	hasUserDefaultOrder: boolean
	onPress: () => void
}

export default function ResetOrderButton({
	hasUserDefaultOrder,
	onPress
}: ResetOrderButtonProps): React.JSX.Element | null {
	const { t } = useTranslation(['settings'])

	if (hasUserDefaultOrder) {
		return null
	}

	return (
		<View className="rounded-md overflow-hidden px-0 bg-card mt-1.5">
			<Pressable onPress={onPress}>
				<Text className="text-base my-[13px] self-center text-notification">
					{t('dashboard.reset')}
				</Text>
			</Pressable>
		</View>
	)
}
