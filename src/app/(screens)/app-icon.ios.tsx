import {
	getAppIconName,
	resetAppIcon,
	setAlternateAppIcon,
	supportsAlternateIcons
} from 'expo-alternate-app-icons'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/error-view'
import Divider from '@/components/Universal/Divider'
import PlatformIcon from '@/components/Universal/Icon'
import SectionView from '@/components/Universal/sections-view'
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

export default function AppIconPicker(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const unlockedAppIcons = usePreferencesStore(
		(state) => state.unlockedAppIcons
	)
	const memberInfo = useMemberStore((s) => s.info)
	const { t } = useTranslation(['settings'])
	const [currentIcon, setCurrentIcon] = React.useState<string>(
		lowercaseFirstLetter(getAppIconName() ?? 'default')
	)
	const categories: Record<string, string[]> = {
		exclusive: ['cat', 'retro'],
		neuland: ['luxury', 'rainbowGlow', 'hacker'],
		default: ['default', 'modernGreen', 'modernPink'],
		rainbow: ['rainbowNeon', 'rainbowMoonLight']
	}
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
			contentContainerStyle={styles.container}
			contentInsetAdjustmentBehavior="automatic"
			showsVerticalScrollIndicator={false}
		>
			{/* Exclusive section */}
			<SectionView
				title={t('appIcon.categories.exclusive')}
				footer={t('appIcon.exclusive')}
			>
				<View style={styles.sectionContainer}>
					{categories.exclusive.map((icon, index) => {
						const unlocked = unlockedAppIcons.includes(icon)
						return (
							<React.Fragment key={icon}>
								<Pressable
									style={styles.rowContainer}
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
									<View style={styles.rowInnerContainer}>
										<Image
											source={iconImages[icon]}
											style={[
												styles.imageContainer,
												!unlocked && styles.imageDimmed
											]}
										/>
										<View style={styles.textContainer}>
											<Text style={styles.iconText}>
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
										<Text style={styles.statusText}>
											{t('appIcon.status.locked')}
										</Text>
									)}
								</Pressable>
								{index !== categories.exclusive.length - 1 && (
									<Divider paddingLeft={110} />
								)}
							</React.Fragment>
						)
					})}
				</View>
			</SectionView>

			{/* Neuland section */}
			<SectionView title={t('appIcon.categories.neuland')}>
				<View style={styles.sectionContainer}>
					{memberInfo ? (
						categories.neuland.map((icon, index) => (
							<React.Fragment key={icon}>
								<Pressable
									style={styles.rowContainer}
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
									<View style={styles.rowInnerContainer}>
										<Image
											source={iconImages[icon]}
											style={styles.imageContainer}
										/>
										<View style={styles.textContainer}>
											<Text style={styles.iconText}>
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
								{index !== categories.neuland.length - 1 && (
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
										style={[
											styles.imageContainer,
											{ marginHorizontal: 4, opacity: 0.6 }
										]}
									/>
								))}
							</View>
							<Text style={styles.statusText}>
								{t('appIcon.exclusivePreviewSubtitle')}
							</Text>
						</Pressable>
					)}
				</View>
			</SectionView>

			{/* Default and rainbow sections */}
			{(['default', 'rainbow'] as const).map((key) => (
				<SectionView title={t(`appIcon.categories.${key}`)} key={key}>
					<View style={styles.sectionContainer}>
						{categories[key].map((icon, index) => (
							<React.Fragment key={icon}>
								<Pressable
									style={styles.rowContainer}
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
									<View style={styles.rowInnerContainer}>
										<Image
											source={iconImages[icon]}
											style={styles.imageContainer}
										/>
										<View style={styles.textContainer}>
											<Text style={styles.iconText}>
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
								{index !== categories[key].length - 1 && (
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

const stylesheet = createStyleSheet((theme) => ({
	container: {
		alignSelf: 'center',
		paddingBottom: 50,
		width: '100%'
	},
	iconText: {
		alignSelf: 'center',
		color: theme.colors.text,
		fontSize: 18,
		fontWeight: '500',
		textAlign: 'center'
	},
	textContainer: {
		justifyContent: 'center'
	},
	statusText: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		textAlign: 'center',
		paddingTop: 4,
		paddingHorizontal: 12
	},
	imageContainer: {
		borderColor: theme.colors.border,
		borderRadius: 18,
		borderWidth: 1,
		height: 80,
		width: 80
	},
	imageDimmed: {
		opacity: 0.3
	},
	rowContainer: {
		alignItems: 'center',

		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingEnd: 20,
		paddingStart: 12,
		paddingVertical: 12
	},
	rowInnerContainer: {
		flexDirection: 'row',
		gap: 32
	},
	sectionContainer: {
		alignContent: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		justifyContent: 'center'
	}
}))
