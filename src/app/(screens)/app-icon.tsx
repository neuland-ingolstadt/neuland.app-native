import {
	getAppIconName,
	resetAppIcon,
	setAlternateAppIcon,
	supportsAlternateIcons
} from 'expo-alternate-app-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
	Image,
	type ImageProps,
	Pressable,
	ScrollView,
	Text,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import ErrorView from '@/components/Error/ErrorView'
import Divider from '@/components/Universal/Divider'
import PlatformIcon from '@/components/Universal/Icon'
import SectionView from '@/components/Universal/SectionsView'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { capitalizeFirstLetter, lowercaseFirstLetter } from '@/utils/app-utils'

let iconImages: Record<string, ImageProps> = {}

iconImages = {
	default: require('@/assets/appIcons/default.png'),
	retro: require('@/assets/appIcons/retro.png'),
	modernGreen: require('@/assets/appIcons/modernGreen.png'),
	modernPink: require('@/assets/appIcons/modernPurple.png'),
	rainbowNeon: require('@/assets/appIcons/rainbowNeon.png'),
	rainbowMoonLight: require('@/assets/appIcons/rainbowMoonLight.png'),
	cat: require('@/assets/appIcons/cat.png')
}

export const appIcons = Object.keys(iconImages)

export default function AppIconPicker(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const unlockedAppIcons = usePreferencesStore(
		(state) => state.unlockedAppIcons
	)
	const { t } = useTranslation(['settings'])
	const [currentIcon, setCurrentIcon] = React.useState<string>(
		lowercaseFirstLetter(getAppIconName() ?? 'default')
	)
	const categories: Record<string, string[]> = {
		exclusive: ['cat', 'retro'],
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
		<>
			<ScrollView>
				<View style={styles.container}>
					{Object.entries(categories).map(([key, value]) => {
						return (
							<SectionView
								// @ts-expect-error cannot verify the type of this prop
								title={t(`appIcon.categories.${key}`)}
								key={key}
								footer={
									key === 'exclusive' ? t('appIcon.exclusive') : undefined
								}
							>
								<View style={styles.sectionContainer}>
									{value.map((icon, index) => {
										const unlocked =
											key !== 'exclusive' || unlockedAppIcons.includes(icon)
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
																		console.log(e)
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
																	// @ts-expect-error cannot verify the type of this prop
																	`appIcon.names.${icon}`
																)}
															</Text>
														</View>
													</View>
													{unlocked && currentIcon === icon && (
														<PlatformIcon
															ios={{
																name: 'checkmark',
																size: 20
															}}
															android={{
																name: 'check',
																size: 24
															}}
															web={{
																name: 'Check',
																size: 20
															}}
														/>
													)}
													{key === 'exclusive' && !unlocked && (
														<Text style={styles.statusText}>
															{t('appIcon.status.locked')}
														</Text>
													)}
												</Pressable>

												{index !== value.length - 1 && (
													<Divider paddingLeft={110} />
												)}
											</React.Fragment>
										)
									})}
								</View>
							</SectionView>
						)
					})}
				</View>
			</ScrollView>
		</>
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
		fontSize: 15
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
