import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'

export const HomeHeaderRight = (): React.JSX.Element => {
	const { t } = useTranslation(['accessibility'])
	const { styles } = useStyles(stylesheet)

	if (Platform.OS === 'ios') {
		return <></>
	}

	return (
		<Pressable
			onPress={() => {
				router.navigate('/dashboard')
			}}
			hitSlop={10}
			style={styles.headerButton}
			accessibilityLabel={t('button.settingsDashboard')}
		>
			<View>
				<PlatformIcon
					ios={{ name: 'gear', size: 22 }}
					android={{ name: 'menu', size: 24 }}
					web={{ name: 'List', size: 24 }}
					style={styles.icon}
				/>
			</View>
		</Pressable>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	headerButton: {
		marginHorizontal: Platform.OS !== 'ios' ? 14 : 0
	},
	icon: {
		color: theme.colors.text
	}
}))
