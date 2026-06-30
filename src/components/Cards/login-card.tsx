import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

import BaseCard from './base-card'

const LoginCard = (): React.JSX.Element => {
	const { t } = useTranslation('navigation')
	return (
		<BaseCard title="login" onPressRoute="/login">
			<View className="gap-3 pt-2.5">
				<View>
					<Text className="text-text text-base font-medium">
						{t('cards.login.title')}
					</Text>
					<Text className="text-label text-[15px]">
						{t('cards.login.message')}
					</Text>
				</View>
			</View>
		</BaseCard>
	)
}

export default LoginCard
