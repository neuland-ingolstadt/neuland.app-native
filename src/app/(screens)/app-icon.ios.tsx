import {
	getAppIconName,
	resetAppIcon,
	setAlternateAppIcon,
	supportsAlternateIcons
} from 'expo-alternate-app-icons'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, Text, View } from 'react-native'
import ErrorView from '@/components/Error/error-view'
import Divider from '@/components/Universal/divider'
import PlatformIcon from '@/components/Universal/icon'
import SectionView from '@/components/Universal/sections-view'
import { Image } from '@/components/Universal/styled'
import { useMemberStore } from '@/hooks/useMemberStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { capitalizeFirstLetter, lowercaseFirstLetter } from '@/utils/app-utils'

// biome-ignore lint/suspicious/noExplicitAny: iconImages is a valid key
let iconImages: Record<string, any> = {}

iconImages = {
	default: require('@/assets/appIcons/default.png'),
	retro: require('@/assets/appIcons/retro.png'),
	modernGreen: require('@/assets/appIcons/modernGreen.png'),
	modernPink: require('@/assets/appIcons/modernPurple.png'),
	rainbowNeon: require('@/assets/appIcons/rainbowNeon.png'),
	rainbowMoonLight: require('@/assets/appIcons/rainbowMoonLight.png'),
	cat: require('@/assets/appIcons/cat.png'),
	luxury: require('@/assets/appIcons/luxury.png'),
	hacker: require('@/assets/appIcons/hacker.png'),
	rainbowGlow: require('@/assets/appIcons/rainbowGlow.png')
}

export const appIcons = Object.keys(iconImages)

const appIconCategories: Record<string, string[]> = {
	exclusive: ['cat', 'retro'],
	neuland: ['luxury', 'rainbowGlow', 'hacker'],
	default: ['default', 'modernGreen', 'modernPink'],
	rainbow: ['rainbowNeon', 'rainbowMoonLight']
}

export default function AppIconPicker(): React.JSX.Element {
	const unlockedAppIcons = usePreferencesStore(
		(state) => state.unlockedAppIcons
	)
	const memberInfo = useMemberStore((s) => s.info)
	const { t } = useTranslation(['settings'])
	const [currentIcon, setCurrentIcon] = React.useState<string>(
		lowercaseFirstLetter(getAppIconName() ?? 'default')
	)
	const support = supportsAlternateIcons
	if (!support) {
		return (
			<ErrorView
				message={t('appIcon.error.message')}
				title={t('appIcon.error.title')}
				isCritical={false}
			/>
		)
	}
	return (
		<ScrollView
			contentContainerClassName="self-center pb-[50px] w-full"
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
		>
			{/* Exclusive section */}
			<SectionView
				title={t('appIcon.categories.exclusive')}
				footer={t('appIcon.exclusive')}
			>
				<View className="content-center bg-card rounded-md justify-center">
					{appIconCategories.exclusive.map((icon, index) => {
						const unlocked = unlockedAppIcons.includes(icon)
						return (
							<React.Fragment key={icon}>
								<Pressable
									className="items-center flex-row justify-between pe-5 ps-3 py-3"
									onPress={
										unlocked
											? async () => {
													try {
														if (icon === 'default') {
															await resetAppIcon()
															setCurrentIcon('default')
														} else {
															await setAlternateAppIcon(
																capitalizeFirstLetter(icon)
															)
															setCurrentIcon(icon)
														}
													} catch (e) {
														console.error(e)
													}
												}
											: undefined
									}
									disabled={!unlocked}
								>
									<View className="flex-row gap-8">
										<Image
											source={iconImages[icon]}
											className={`border border-border rounded-[18px] h-20 w-20${!unlocked ? ' opacity-30' : ''}`}
										/>
										<View className="justify-center">
											<Text className="self-center text-text text-lg font-medium text-center">
												{t(
													// @ts-expect-error - icon is a valid key
													`appIcon.names.${icon}`
												)}
											</Text>
										</View>
									</View>
									{unlocked && currentIcon === icon && (
										<PlatformIcon
											ios={{ name: 'checkmark', size: 20 }}
											android={{ name: 'check', size: 24 }}
											web={{ name: 'Check', size: 20 }}
										/>
									)}
									{!unlocked && (
										<Text className="text-label-secondary text-[13px] text-center pt-1 px-3">
											{t('appIcon.status.locked')}
										</Text>
									)}
								</Pressable>
								{index !== appIconCategories.exclusive.length - 1 && (
									<Divider paddingLeft={110} />
								)}
							</React.Fragment>
						)
					})}
				</View>
			</SectionView>

			{/* Neuland section */}
			<SectionView title={t('appIcon.categories.neuland')}>
				<View className="content-center bg-card rounded-md justify-center">
					{memberInfo ? (
						appIconCategories.neuland.map((icon, index) => (
							<React.Fragment key={icon}>
								<Pressable
									className="items-center flex-row justify-between pe-5 ps-3 py-3"
									onPress={async () => {
										try {
											await setAlternateAppIcon(capitalizeFirstLetter(icon))
											setCurrentIcon(icon)
										} catch (e) {
											console.error(e)
										}
									}}
									disabled={false}
								>
									<View className="flex-row gap-8">
										<Image
											source={iconImages[icon]}
											className="border border-border rounded-[18px] h-20 w-20"
										/>
										<View className="justify-center">
											<Text className="self-center text-text text-lg font-medium text-center">
												{
													// @ts-expect-error - icon is a valid key
													t(`appIcon.names.${icon}`)
												}
											</Text>
										</View>
									</View>
									{currentIcon === icon && (
										<PlatformIcon
											ios={{ name: 'checkmark', size: 20 }}
											android={{ name: 'check', size: 24 }}
											web={{ name: 'Check', size: 20 }}
										/>
									)}
								</Pressable>
								{index !== appIconCategories.neuland.length - 1 && (
									<Divider paddingLeft={110} />
								)}
							</React.Fragment>
						))
					) : (
						<Pressable
							style={{ alignItems: 'center', paddingVertical: 12 }}
							onPress={() => {
								router.navigate('/member')
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'center',
									gap: 16,
									marginVertical: 8
								}}
							>
								{['rainbowGlow', 'luxury', 'hacker'].map((icon) => (
									<Image
										key={icon}
										source={iconImages[icon]}
										className="border border-border rounded-[18px] h-20 w-20 mx-1 opacity-60"
									/>
								))}
							</View>
							<Text className="text-label-secondary text-[13px] text-center pt-1 px-3">
								{t('appIcon.exclusivePreviewSubtitle')}
							</Text>
						</Pressable>
					)}
				</View>
			</SectionView>

			{/* Default and rainbow sections */}
			{(['default', 'rainbow'] as const).map((key) => (
				<SectionView title={t(`appIcon.categories.${key}`)} key={key}>
					<View className="content-center bg-card rounded-md justify-center">
						{appIconCategories[key].map((icon, index) => (
							<React.Fragment key={icon}>
								<Pressable
									className="items-center flex-row justify-between pe-5 ps-3 py-3"
									onPress={async () => {
										try {
											if (icon === 'default') {
												await resetAppIcon()
												setCurrentIcon('default')
											} else {
												await setAlternateAppIcon(capitalizeFirstLetter(icon))
												setCurrentIcon(icon)
											}
										} catch (e) {
											console.error(e)
										}
									}}
									disabled={false}
								>
									<View className="flex-row gap-8">
										<Image
											source={iconImages[icon]}
											className="border border-border rounded-[18px] h-20 w-20"
										/>
										<View className="justify-center">
											<Text className="self-center text-text text-lg font-medium text-center">
												{
													// @ts-expect-error - icon is a valid key
													t(`appIcon.names.${icon}`)
												}
											</Text>
										</View>
									</View>
									{currentIcon === icon && (
										<PlatformIcon
											ios={{ name: 'checkmark', size: 20 }}
											android={{ name: 'check', size: 24 }}
											web={{ name: 'Check', size: 20 }}
										/>
									)}
								</Pressable>
								{index !== appIconCategories[key].length - 1 && (
									<Divider paddingLeft={110} />
								)}
							</React.Fragment>
						))}
					</View>
				</SectionView>
			))}
		</ScrollView>
	)
}
