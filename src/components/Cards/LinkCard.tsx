import { quicklinks } from '@/data/constants'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { MaterialIcon } from '@/types/material-icons'
import { trackEvent } from '@aptabase/react-native'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import PlatformIcon, { type LucideIcon } from '../Universal/Icon'
import BaseCard from './BaseCard'

const LinkCard = (): React.JSX.Element => {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('common')

	const recentQuicklinks = usePreferencesStore(
		(state) => state.recentQuicklinks
	)
	const addRecentQuicklink = usePreferencesStore(
		(state) => state.addRecentQuicklink
	)
	const userQuicklinks = recentQuicklinks
		.map((title) => quicklinks.find((quicklink) => quicklink.key === title))
		.filter((quicklink) => quicklink !== undefined)
	const linkPress = async (key: string, url: string): Promise<void> => {
		addRecentQuicklink(key)
		trackEvent('Quicklink', { link: key })
		await Linking.openURL(url)
	}

	return (
		<BaseCard title="links" onPressRoute="/links">
			<View style={styles.cardsFilled}>
				{userQuicklinks.map((link, index) => {
					if (link === undefined) {
						return null
					}
					return (
						<Pressable
							key={index}
							onPress={() => {
								void linkPress(link.key, link.url)
							}}
							style={styles.linkBox}
						>
							<PlatformIcon
								ios={{
									name: link.icon.ios,
									size: 17,
									weight: 'semibold'
								}}
								android={{
									name: link.icon.android as MaterialIcon,
									size: 21,
									variant: 'outlined'
								}}
								web={{
									name: link.icon.web as LucideIcon,
									size: 21
								}}
							/>
							<Text
								style={styles.eventTitle}
								numberOfLines={1}
								adjustsFontSizeToFit={Platform.OS === 'ios'}
								minimumFontScale={0.8}
								ellipsizeMode="tail"
							>
								{t(
									// @ts-expect-error Type cannot be verified
									[`quicklinks.${link.key}`, link.key]
								)}
							</Text>
						</Pressable>
					)
				})}
			</View>
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	cardsFilled: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		paddingTop: 14
	},
	eventTitle: {
		color: theme.colors.text,
		flexShrink: 1,
		fontSize: 14.5,
		fontWeight: '500'
	},
	linkBox: {
		alignItems: 'center',
		backgroundColor: theme.colors.cardButton,
		borderRadius: theme.radius.md,
		flex: 1,
		gap: Platform.OS === 'android' ? 2 : 7,
		justifyContent: 'space-between',
		paddingBottom: 7,
		paddingHorizontal: 8,
		paddingTop: 12
	}
}))

export default LinkCard
