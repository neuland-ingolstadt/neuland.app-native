import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import PlatformIcon from '../Universal/Icon'

interface HeaderRightProps {
	setToday: () => void
}

export function HeaderRight({ setToday }: HeaderRightProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['accessibility'])
	return (
		<Pressable
			onPress={setToday}
			style={styles.headerButton}
			hitSlop={10}
			accessibilityLabel={t('button.timetableBack')}
		>
			<PlatformIcon
				ios={{
					name: 'arrow.uturn.left',
					size: 22
				}}
				android={{
					name: 'keyboard_return',
					size: 24
				}}
				web={{
					name: 'Undo2',
					size: 24
				}}
				style={styles.icon}
			/>
		</Pressable>
	)
}

interface HeaderLeftProps {
	onPressPreferences: () => void
	onPressPrevious?: () => void
	onPressNext?: () => void
}

export function HeaderLeft({
	onPressPreferences,
	onPressPrevious,
	onPressNext
}: HeaderLeftProps): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('accessibility')
	return (
		<View style={styles.container}>
			<Pressable
				onPress={onPressPreferences}
				style={styles.headerButton}
				hitSlop={10}
			>
				<PlatformIcon
					ios={{ name: 'gear', size: 22 }}
					android={{ name: 'settings', size: 24, variant: 'outlined' }}
					web={{ name: 'Settings', size: 24 }}
					style={styles.icon}
				/>
			</Pressable>
			{Platform.OS === 'web' && onPressPrevious && onPressNext && (
				<View style={styles.subButtons}>
					<Pressable
						onPress={onPressPrevious}
						style={styles.headerButton}
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
						style={styles.headerButton}
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
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	headerButton: {
		marginHorizontal: Platform.OS !== 'ios' ? 10 : 0
	},
	icon: {
		color: theme.colors.text
	},
	container: {
		flexDirection: 'row',
		gap: 8
	},
	subButtons: {
		flexDirection: 'row'
	}
}))
