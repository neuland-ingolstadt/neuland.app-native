import { Link } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'

export const HomeHeaderRight = (): React.JSX.Element | undefined => {
	const { t } = useTranslation(['accessibility'])
	const textColor = toColor(useCSSVariable('--color-text'))

	if (Platform.OS === 'ios') {
		return undefined
	}

	return (
		<Link asChild href="/dashboard">
			<Pressable
				hitSlop={10}
				className="android:mx-3.5 web:mx-3.5"
				accessibilityLabel={t('button.settingsDashboard')}
			>
				<View>
					<PlatformIcon
						ios={{ name: 'gear', size: 22 }}
						android={{ name: 'menu', size: 24 }}
						web={{ name: 'List', size: 24 }}
						style={{ color: textColor }}
					/>
				</View>
			</Pressable>
		</Link>
	)
}
