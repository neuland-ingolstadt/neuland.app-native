import { type Href, Link, type RelativePathString, router } from 'expo-router'
import type React from 'react'
import { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { USER_GUEST } from '@/data/constants'
import { DashboardContext, UserKindContext } from '../contexts'
import { cardIcons } from '../icons'
import PlatformIcon from '../Universal/Icon'
import { CardContextMenu } from './card-context-menu'

interface BaseCardProps {
	title: string
	onPressRoute?: Href
	children?: React.ReactNode
	noDataComponent?: React.ReactNode
	noDataPredicate?: () => boolean
}

const BaseCard: React.FC<BaseCardProps> = ({
	title,
	onPressRoute,
	children,
	noDataComponent,
	noDataPredicate
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
		rotation.value = withTiming(1, { duration: 150 })
	}

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 10, stiffness: 100 })
		rotation.value = withTiming(0, { duration: 300 })
	}

	const { resetOrder } = use(DashboardContext)
	const { userKind = USER_GUEST } = use(UserKindContext)

	const cardStyle = [styles.card, onPressRoute == null && styles.cardDisabled]

	const cardContent = (
		<View style={cardStyle}>
			<View style={styles.contentWrapper}>
				<View style={styles.titleView}>
					<View style={[styles.iconContainer]}>
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
							/>
						</Animated.View>
					</View>

					<Text style={styles.title}>
						{t(
							// @ts-expect-error type check
							`cards.titles.${title}`
						)}
					</Text>
					{onPressRoute != null && (
						<PlatformIcon
							ios={{
								name: 'chevron.forward',
								size: 12
							}}
							android={{
								name: 'chevron_right',
								size: 26
							}}
							web={{
								name: 'ChevronRight',
								size: 24
							}}
							style={styles.labelColor}
						/>
					)}
				</View>
				{noDataPredicate?.()
					? noDataComponent != null && (
							<View style={styles.childrenContainer}>{noDataComponent}</View>
						)
					: children != null && (
							<View style={styles.childrenContainer}>{children}</View>
						)}
			</View>
		</View>
	)

	if (Platform.OS === 'ios' && DeviceInfo.getDeviceType() !== 'Desktop') {
		return (
			<CardContextMenu
				card={
					<Pressable
						disabled={onPressRoute == null}
						onPress={() => {
							if (onPressRoute != null) {
								router.push(onPressRoute as RelativePathString)
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
	return (
		<Link
			asChild
			href={onPressRoute as RelativePathString}
			disabled={onPressRoute == null}
		>
			<Pressable
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				style={styles.pressable}
			>
				{cardContent}
			</Pressable>
		</Link>
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
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 4,
		backgroundColor: theme.colors.primaryBackground
	},
	cardIcon: {
		color: theme.colors.primary
	},
	labelColor: {
		color: theme.colors.labelColor,
		opacity: 0.6
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
