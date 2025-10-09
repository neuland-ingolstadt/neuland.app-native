import { Link } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'

export const FoodHeaderRight = (): React.JSX.Element => {
	const { t } = useTranslation(['accessibility'])
	const { styles } = useStyles(stylesheet)
	return (
		<Link asChild href="/food-preferences">
			<Pressable
				hitSlop={10}
				style={styles.headerButton}
				accessibilityLabel={t('button.foodPreferences')}
			>
				<View>
					<PlatformIcon
						ios={{
							name: 'line.3.horizontal.decrease',
							size: 20
						}}
						android={{
							name: 'filter_list',
							size: 24
						}}
						web={{
							name: 'ListFilter',
							size: 24
						}}
						style={styles.icon}
					/>
				</View>
			</Pressable>
		</Link>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	headerButton: {
		marginHorizontal: Platform.OS !== 'ios' ? 14 : 4
	},
	icon: {
		color: theme.colors.text
	}
}))
