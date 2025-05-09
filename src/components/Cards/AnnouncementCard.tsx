import type {
	AnnouncementFieldsFragment,
	Platform as AppPlatform,
	UserKind
} from '@/__generated__/gql/graphql'
import i18n from '@/localization/i18n'
import { trackEvent } from '@aptabase/react-native'
import type React from 'react'
import { memo, useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Linking,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View
} from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
	interpolate
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon from '../Universal/Icon'
import { DashboardContext, UserKindContext } from '../contexts'

interface AnnouncementCardProps {
	data: AnnouncementFieldsFragment[]
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ data }) => {
	const { hiddenAnnouncements, hideAnnouncement } = useContext(DashboardContext)
	const { t } = useTranslation('navigation')
	const { userKind = 'guest' } = useContext(UserKindContext)
	const { styles } = useStyles(stylesheet)

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
			const now = Date.now()
			return announcements
				.filter(
					(announcement) =>
						announcement?.platform?.includes(
							Platform.OS.toUpperCase() as AppPlatform
						) &&
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
			if (url != null) {
				trackEvent('Announcement', { link: id })
				void Linking.openURL(url)
			}
		},
		[]
	)

	if (filteredAnnouncements.length === 0) {
		return null
	}

	const { id, title, description, url } = filteredAnnouncements[0]

	const cardStyle = [styles.card]

	return (
		<Pressable
			onPress={handlePressLink(url, id)}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={cardStyle}
		>
			<View style={styles.contentWrapper}>
				<View style={styles.titleView}>
					<View style={styles.iconContainer}>
						<Animated.View style={animatedIconStyle}>
							<PlatformIcon
								ios={{ name: 'megaphone.fill', size: 15 }}
								android={{ name: 'campaign', size: 23, variant: 'outlined' }}
								web={{ name: 'Megaphone', size: 20 }}
							/>
						</Animated.View>
					</View>
					<Text style={styles.title}>
						{
							// @ts-expect-error type check
							title[i18n.language]
						}
					</Text>
					<Pressable
						onPress={handlePressClose(id)}
						hitSlop={10}
						style={styles.closeButton}
					>
						<PlatformIcon
							ios={{ name: 'xmark', size: 16 }}
							android={{ name: 'close', size: 24 }}
							web={{ name: 'X', size: 20 }}
							style={styles.closeIcon}
						/>
					</Pressable>
				</View>
				<Text style={styles.description}>
					{
						// @ts-expect-error type check
						description[i18n.language]
					}
				</Text>
				{url != null && (
					<Text style={styles.footer}>{t('cards.announcements.readMore')}</Text>
				)}
			</View>
		</Pressable>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	card: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: theme.radius.lg,
		marginHorizontal: theme.margins.page,
		marginVertical: 6,
		width: 'auto',
		overflow: 'hidden'
	},
	contentWrapper: {
		padding: theme.margins.card
	},
	closeButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	closeIcon: {
		color: theme.colors.labelColor,
		opacity: 0.7
	},
	iconContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: theme.colors.cardIconBackground,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 4
	},
	description: {
		color: theme.colors.text,
		fontSize: 15,
		marginTop: 12
	},
	footer: {
		color: theme.colors.labelColor,
		fontSize: 12,
		marginTop: 14,
		textAlign: 'right'
	},
	title: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 17,
		fontWeight: '600',
		paddingBottom: Platform.OS === 'android' ? 2 : 0
	},
	titleView: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 10
	}
}))

export default memo(AnnouncementCard)
