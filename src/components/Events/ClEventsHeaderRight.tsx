import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'

export const ClEventsHeaderRight = (): React.JSX.Element => {
	const { t } = useTranslation(['accessibility'])
	const { styles } = useStyles(stylesheet)
	return (
		<Link asChild href="/cl-clubs">
			<Pressable
				hitSlop={10}
				style={styles.headerButton}
				accessibilityLabel={t('button.clubsFollow')}
			>
				<View>
					<PlatformIcon
						ios={{ name: 'person.2.fill', size: 22 }}
						android={{ name: 'groups', size: 24 }}
						web={{ name: 'Users', size: 24 }}
						style={styles.icon}
					/>
				</View>
			</Pressable>
		</Link>
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
