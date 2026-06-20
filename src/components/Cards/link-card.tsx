import { trackEvent } from '@aptabase/react-native'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { quicklinks } from '@/data/constants'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type { MaterialIcon } from '@/types/material-icons'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

import PlatformIcon, { type LucideIcon } from '../Universal/Icon'
import BaseCard from './base-card'

const LinkCard = (): React.JSX.Element => {
	const textColor = useCSSVariable('--color-text')
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
			<View className="flex-row flex-wrap gap-2.5 pt-2.5">
				{userQuicklinks.map((link, index) => {
					if (link === undefined) {
						return null
					}
					return (
						<Pressable
							key={index}
							className="items-center bg-card-button border border-border rounded-md flex-1 ios:gap-[7px] android:gap-0.5 justify-center pb-2 px-3 pt-3 min-h-[65px]"
							style={hairlineBorder}
							onPress={() => {
								void linkPress(link.key, link.url)
							}}
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
								style={{
									color: toColor(textColor)
								}}
							/>
							<Text
								className="text-text shrink text-[14.5px] font-medium"
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

export default LinkCard
