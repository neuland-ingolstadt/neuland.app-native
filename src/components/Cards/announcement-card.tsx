import { trackEvent } from '@aptabase/react-native'
import type React from 'react'
import { memo, use, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Image,
	Linking,
	Platform,
	Pressable,
	Text,
	useWindowDimensions,
	View
} from 'react-native'
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import type {
	AnnouncementFieldsFragment,
	UserKind
} from '@/__generated__/gql/graphql'
import i18n from '@/localization/i18n'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import { getAnnouncementPlatform } from '@/utils/web-host'
import { DashboardContext, UserKindContext } from '../contexts'
import PlatformIcon from '../Universal/icon'

interface AnnouncementCardProps {
	data: AnnouncementFieldsFragment[]
}

const AnnouncementCard = ({
	data
}: AnnouncementCardProps): React.JSX.Element | null => {
	const { hiddenAnnouncements, hideAnnouncement } = use(DashboardContext)
	const { t } = useTranslation('navigation')
	const { userKind = 'guest' } = use(UserKindContext)
	const labelColor = toColor(useCSSVariable('--color-label'))
	const { width } = useWindowDimensions()
	const isLargeScreen = width > 768

	const scale = useSharedValue(1)
	const rotation = useSharedValue(0)

	const animatedIconStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{ scale: scale.value },
				{ rotate: `${interpolate(rotation.value, [0, 1], [0, 3.5])}deg` }
			]
		}
	})

	const handlePressIn = () => {
		scale.value = withSpring(1.1, { damping: 10, stiffness: 100 })
		rotation.value = withTiming(1, { duration: 150 })
	}

	const handlePressOut = () => {
		scale.value = withSpring(1, { damping: 10, stiffness: 100 })
		rotation.value = withTiming(0, { duration: 150 })
	}

	const filterAnnouncements = useCallback(
		(
			announcements: AnnouncementFieldsFragment[]
		): AnnouncementFieldsFragment[] => {
			const platform = getAnnouncementPlatform()
			const now = Date.now()
			return announcements
				.filter(
					(announcement) =>
						announcement?.platform?.includes(platform) &&
						announcement?.userKind?.includes(
							userKind?.toUpperCase() as UserKind
						) &&
						new Date(announcement.startDateTime).getTime() < now &&
						new Date(announcement.endDateTime).getTime() > now &&
						!hiddenAnnouncements.includes(announcement.id)
				)
				.sort((a, b) => a.priority - b.priority)
		},
		[hiddenAnnouncements, userKind]
	)

	const filteredAnnouncements = useMemo(
		() => filterAnnouncements(data),
		[data, filterAnnouncements]
	)

	const handlePressClose = useCallback(
		(id: string) => () => {
			trackEvent('Announcement', { close: id })
			hideAnnouncement(id)
		},
		[hideAnnouncement]
	)

	const handlePressLink = useCallback(
		(url: string | null | undefined, id: string) => () => {
			if (url != null && url !== '') {
				trackEvent('Announcement', { link: id })
				void Linking.openURL(url)
			}
		},
		[]
	)

	if (filteredAnnouncements.length === 0) {
		return null
	}

	const { id, title, description, url, imageUrl } = filteredAnnouncements[0]

	return (
		<Pressable
			onPress={handlePressLink(url, id)}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			className="bg-card border-border rounded-lg mx-page my-1.5 w-auto overflow-hidden"
			style={hairlineBorder}
		>
			<View className="p-card">
				<View className="items-center flex-row gap-2.5">
					<View className="w-9 h-9 rounded-full bg-primary-background justify-center items-center mr-1">
						<Animated.View style={animatedIconStyle}>
							<PlatformIcon
								ios={{ name: 'megaphone.fill', size: 15 }}
								android={{ name: 'campaign', size: 23, variant: 'outlined' }}
								web={{ name: 'Megaphone', size: 20 }}
							/>
						</Animated.View>
					</View>
					<Text className="text-text flex-1 text-[17px] font-semibold android:pb-0.5">
						{
							// @ts-expect-error type check
							title[i18n.language]
						}
					</Text>
					<Pressable
						onPress={handlePressClose(id)}
						hitSlop={10}
						className="w-8 h-8 items-center justify-center"
					>
						<PlatformIcon
							ios={{ name: 'xmark', size: 14 }}
							android={{ name: 'close', size: 24 }}
							web={{ name: 'X', size: 20 }}
							style={{ color: labelColor, opacity: 0.7 }}
						/>
					</Pressable>
				</View>
				<View
					className={`gap-card items-start ${isLargeScreen ? 'flex-row' : 'flex-col'}`}
				>
					<Text className="text-text text-[15px] mt-3 flex-1">
						{
							// @ts-expect-error type check
							description[i18n.language]
						}
					</Text>
					{imageUrl && (
						<Image
							source={{ uri: imageUrl }}
							className={`w-full self-center rounded-md max-w-[450px] h-[130px] ${isLargeScreen ? 'w-[450px] mt-0 flex-1' : ''}`}
							style={
								Platform.OS === 'web'
									? { resizeMode: 'cover' }
									: { objectFit: 'cover' }
							}
						/>
					)}
				</View>
				{url != null && url !== '' && (
					<Text className="text-label text-xs mt-3 text-right">
						{t('cards.announcements.readMore')}
					</Text>
				)}
			</View>
		</Pressable>
	)
}

export default memo(AnnouncementCard)
