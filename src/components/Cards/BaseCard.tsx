import { USER_GUEST } from '@/data/constants'
import type React from 'react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
	interpolate
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { type Href, type RelativePathString, router } from 'expo-router'
import PlatformIcon from '../Universal/Icon'
import { DashboardContext, UserKindContext } from '../contexts'
import { cardIcons } from '../icons'
import { CardContextMenu } from './CardContextMenu'

interface BaseCardProps {
	title: string
	onPressRoute?: Href
	children?: React.ReactNode
}

const BaseCard: React.FC<BaseCardProps> = ({
	title,
	onPressRoute,
	children
}) => {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('navigation')

	const scale = useSharedValue(1)
	const rotation = useSharedValue(0)

	const animatedIconStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ scale: scale.value },
				{ rotate: `${interpolate(rotation.value, [0, 1], [0, 4])}deg` }
			]
		}
	})

	const handlePressIn = () => {
		scale.value = withSpring(1.15, { damping: 10, stiffness: 100 })
		rotation.value = withTiming(1, { duration: 175 })
	}

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 10, stiffness: 100 })
		rotation.value = withTiming(0, { duration: 300 })
	}

	const { resetOrder } = useContext(DashboardContext)
	const { userKind = USER_GUEST } = useContext(UserKindContext)

	const cardStyle = [styles.card, onPressRoute == null && styles.cardDisabled]

	const cardContent = (
		<View style={cardStyle}>
			<View style={styles.contentWrapper}>
				<View style={styles.titleView}>
					<View style={styles.iconContainer}>
						<Animated.View style={animatedIconStyle}>
							<PlatformIcon
								ios={{
									name: cardIcons[title as keyof typeof cardIcons]?.ios,
									size:
										16.5 *
										(cardIcons[title as keyof typeof cardIcons]?.iosScale ?? 1)
								}}
								android={{
									name: cardIcons[title as keyof typeof cardIcons]?.android,
									size: 23,
									variant: 'outlined'
								}}
								web={{
									name: cardIcons[title as keyof typeof cardIcons]?.web,
									size: 20
								}}
								style={styles.cardIcon}
							/>
						</Animated.View>
					</View>

					<Text style={styles.title}>
						{
							// @ts-expect-error type check
							t(`cards.titles.${title}`)
						}
					</Text>
					{onPressRoute != null && (
						<PlatformIcon
							ios={{
								name: 'chevron.forward',
								size: 16
							}}
							android={{
								name: 'chevron_right',
								size: 26
							}}
							web={{
								name: 'ChevronRight',
								size: 24
							}}
							style={styles.chevronIcon}
						/>
					)}
				</View>
				{children != null && (
					<View style={styles.childrenContainer}>{children}</View>
				)}
			</View>
		</View>
	)

	return (
		<CardContextMenu
			card={
				<Pressable
					disabled={onPressRoute == null}
					onPress={() => {
						if (onPressRoute != null) {
							router.navigate(onPressRoute as RelativePathString)
						}
					}}
					delayLongPress={300}
					onPressIn={handlePressIn}
					onPressOut={handlePressOut}
					onLongPress={() => {}}
					style={styles.pressable}
				>
					{cardContent}
				</Pressable>
			}
			resetOrder={resetOrder}
			userKind={userKind}
		/>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	card: {
		backgroundColor: theme.colors.card,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: theme.radius.lg,
		borderColor: theme.colors.border,
		width: '100%'
	},
	contentWrapper: {
		padding: theme.margins.card,
		marginVertical: 1.5
	},
	pressable: {
		width: '100%'
	},
	cardDisabled: {
		opacity: 0.8
	},
	iconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: `${theme.colors.primary}20`,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 4
	},
	cardIcon: {
		color: theme.colors.primary
	},
	chevronIcon: {
		color: theme.colors.labelColor,
		opacity: 0.7
	},
	labelColor: {
		color: theme.colors.labelColor
	},
	title: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 16,
		fontWeight: '600'
	},
	titleView: {
		alignItems: 'center',
		color: theme.colors.text,
		flexDirection: 'row',
		gap: 10
	},
	childrenContainer: {
		marginTop: 6
	}
}))

export default BaseCard
