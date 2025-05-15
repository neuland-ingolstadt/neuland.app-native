import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '../Universal/Icon'

interface HeaderRightProps {
	setToday: () => void
	onPressPreferences: () => void
	onPressPrevious?: () => void
	onPressNext?: () => void
}

export function HeaderRight({
	setToday,
	onPressPreferences,
	onPressPrevious,
	onPressNext
}: HeaderRightProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['accessibility'])
	return (
		<View style={styles.container}>
			<Pressable
				onPress={setToday}
				hitSlop={10}
				accessibilityLabel={t('button.timetableBack')}
			>
				<PlatformIcon
					ios={{
						name: 'arrow.uturn.left',
						size: 22
					}}
					android={{
						name: 'calendar_today',
						size: 24
					}}
					web={{
						name: 'Undo2',
						size: 24
					}}
					style={styles.icon}
				/>
			</Pressable>
			{Platform.OS === 'web' && onPressPrevious && onPressNext && (
				<View style={styles.subButtons}>
					<Pressable
						onPress={onPressPrevious}
						hitSlop={10}
						accessibilityLabel={t('button.previous')}
					>
						<PlatformIcon
							ios={{ name: 'chevron-left', size: 22 }}
							android={{ name: 'chevron_right', size: 24 }}
							web={{ name: 'ChevronLeft', size: 24 }}
							style={styles.icon}
						/>
					</Pressable>
					<Pressable
						onPress={onPressNext}
						hitSlop={10}
						accessibilityLabel={t('button.next')}
					>
						<PlatformIcon
							ios={{ name: 'chevron-right', size: 22 }}
							android={{ name: 'chevron_right', size: 24 }}
							web={{ name: 'ChevronRight', size: 24 }}
							style={styles.icon}
						/>
					</Pressable>
				</View>
			)}
			<Pressable
				onPress={onPressPreferences}
				style={styles.container}
				hitSlop={10}
			>
				<PlatformIcon
					ios={{ name: 'gear', size: 22 }}
					android={{ name: 'settings', size: 24, variant: 'filled' }}
					web={{ name: 'Settings', size: 24 }}
					style={styles.icon}
				/>
			</Pressable>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	icon: {
		color: theme.colors.text
	},
	container: {
		flexDirection: 'row',
		gap: 5,
		marginHorizontal: Platform.OS !== 'ios' ? 6 : 0
	},
	subButtons: {
		marginLeft: 8,
		gap: 8,
		flexDirection: 'row'
	}
}))
