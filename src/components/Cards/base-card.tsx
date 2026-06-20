import { type Href, Link, type RelativePathString, router } from 'expo-router'
import type React from 'react'
import { use } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import { USER_GUEST } from '@/data/constants'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
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

const BaseCard = ({
	title,
	onPressRoute,
	children,
	noDataComponent,
	noDataPredicate
}: BaseCardProps): React.JSX.Element => {
	const { t } = useTranslation('navigation')
	const labelColor = useCSSVariable('--color-label')

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

	const cardContent = (
		<View
			className={`w-full overflow-hidden border border-border bg-card rounded-lg ios:rounded-[28px] ${onPressRoute == null ? 'opacity-80' : ''}`}
			style={hairlineBorder}
		>
			<View className="p-card my-[1.5px]">
				<View className="items-center flex-row gap-2.5">
					<View className="w-9 h-9 rounded-[18px] justify-center items-center mr-1 bg-primary-background">
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

					<Text className="text-text flex-1 text-base font-semibold">
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
							style={{
								color: toColor(labelColor),
								opacity: 0.6
							}}
						/>
					)}
				</View>
				{noDataPredicate?.()
					? noDataComponent != null && (
							<View className="mt-1.5">{noDataComponent}</View>
						)
					: children != null && <View className="mt-1.5">{children}</View>}
			</View>
		</View>
	)

	if (Platform.OS === 'ios' && DeviceInfo.getDeviceType() !== 'Desktop') {
		return (
			<CardContextMenu
				card={
					<Pressable
						className="w-full"
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
				className="w-full"
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
			>
				{cardContent}
			</Pressable>
		</Link>
	)
}

export default BaseCard
