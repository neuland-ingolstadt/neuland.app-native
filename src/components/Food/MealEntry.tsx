// @ts-expect-error - no types available
import DragDropView from '@/components/Exclusive/DragView'
import ContextMenu from '@/components/Flow/ContextMenu'
import PlatformIcon from '@/components/Universal/Icon'
import { UserKindContext } from '@/components/contexts'
import type { UserKindContextType } from '@/contexts/userKind'
import { USER_GUEST } from '@/data/constants'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { LanguageKey } from '@/localization/i18n'
import type { Meal } from '@/types/neuland-api'
import {
	convertRelevantAllergens,
	convertRelevantFlags,
	formatPrice,
	getUserSpecificLabel,
	getUserSpecificPrice,
	humanLocations,
	mealName,
	shareMeal
} from '@/utils/food-utils'
import { trackEvent } from '@aptabase/react-native'
import { router } from 'expo-router'
import type React from 'react'
import { memo, useContext, useDeferredValue, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

/**
 * Renders a single meal entry in the food menu.
 * @param meal - The meal object to render.
 * @param index - The index of the meal in the list.
 * @returns A JSX element representing the meal entry.
 */
export const MealEntry = memo(
	({ meal, index }: { meal: Meal; index: number }): React.JSX.Element => {
		const preferencesSelection = useFoodFilterStore(
			(state) => state.preferencesSelection
		)
		const allergenSelection = useFoodFilterStore(
			(state) => state.allergenSelection
		)
		const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)

		// Use deferredValue for filter properties to prevent UI blocking
		const deferredPreferences = useDeferredValue(preferencesSelection)
		const deferredAllergens = useDeferredValue(allergenSelection)
		const deferredFoodLanguage = useDeferredValue(foodLanguage)

		const { t, i18n } = useTranslation('food')
		const { styles } = useStyles(stylesheet)
		const userAllergens = useMemo(
			() =>
				convertRelevantAllergens(
					meal.allergens ?? [],
					deferredAllergens,
					i18n.language
				),
			[meal.allergens, deferredAllergens, i18n.language]
		)
		const { userKind = USER_GUEST } =
			useContext<UserKindContextType>(UserKindContext)
		const userFlags = useMemo(
			() =>
				convertRelevantFlags(
					meal.flags ?? [],
					deferredPreferences,
					i18n.language
				),
			[meal.flags, deferredPreferences, i18n.language]
		)
		const setSelectedMeal = useRouteParamsStore(
			(state) => state.setSelectedMeal
		)
		const price = getUserSpecificPrice(meal, userKind ?? 'guest')
		const label =
			price !== '' ? getUserSpecificLabel(userKind ?? 'guest', t) : ''

		const isNotConfigured =
			deferredAllergens.length === 1 &&
			deferredAllergens[0] === 'not-configured'
		const hasSelectedAllergens =
			deferredAllergens.length > 0 && !isNotConfigured
		const hasUserAllergens = userAllergens.length > 0 && !isNotConfigured
		const hasNoMealAllergens = hasSelectedAllergens && meal.allergens === null

		const shouldShowAllergens = hasUserAllergens || hasNoMealAllergens

		const iconName = hasUserAllergens
			? 'exclamationmark.triangle'
			: 'info.circle'
		const androidName = hasUserAllergens ? 'warning' : 'info'
		const webName = hasUserAllergens ? 'TriangleAlert' : 'Info'
		const textContent = hasUserAllergens
			? userAllergens
			: t('empty.noAllergens')

		const [key, setKey] = useState(Math.random())

		const itemPressed = (): void => {
			setSelectedMeal(meal)
			router.navigate({
				pathname: '/meal'
			})
		}
		return (
			<DragDropView
				mode="drag"
				scope="system"
				dragValue={t('details.share.message', {
					meal: meal.name[i18n.language as LanguageKey],
					price: formatPrice(meal.prices[userKind ?? 'guest']),
					location:
						humanLocations[meal.restaurant as keyof typeof humanLocations],
					id: meal.id
				})}
			>
				<ContextMenu
					title={humanLocations[meal.restaurant as keyof typeof humanLocations]}
					key={key}
					style={styles.contextMenu}
					actions={[
						{
							title: meal.allergens?.join(', ') ?? t('empty.noAllergens'),
							subtitle:
								meal.allergens !== null
									? t('preferences.formlist.allergens')
									: undefined,
							systemIcon:
								Platform.OS === 'ios' ? 'exclamationmark.triangle' : undefined,
							disabled: true
						},
						{
							title: t('misc.share', { ns: 'common' }),
							systemIcon:
								Platform.OS === 'ios' ? 'square.and.arrow.up' : undefined
						}
					]}
					onPreviewPress={itemPressed}
					onPress={(e) => {
						if (e.nativeEvent.name === t('misc.share', { ns: 'common' })) {
							trackEvent('Share', {
								type: 'meal'
							})
							shareMeal(meal, i18n, userKind)
						}
						setKey(Math.random())
					}}
				>
					<Pressable
						onPress={itemPressed}
						delayLongPress={300}
						onLongPress={() => {
							/* nothing */
						}}
						style={styles.pressable}
					>
						<View key={index} style={styles.container}>
							<View style={styles.innerContainer}>
								<Text style={styles.title} numberOfLines={2}>
									{mealName(
										meal.name,
										deferredFoodLanguage,
										i18n.language as LanguageKey
									)}
								</Text>
								{meal.variants?.length > 0 && (
									<View style={styles.variantContainer}>
										<Text style={styles.variantText}>
											{`+ ${meal.variants.length}`}
										</Text>
									</View>
								)}
							</View>
							<View style={styles.detailsContainer}>
								<View style={styles.detailsColumns}>
									<View style={styles.flags}>
										{userFlags.map(
											(
												flag: { name: string; isVeg: boolean },
												index: number
											) => (
												<View key={index} style={styles.flagsBox}>
													{flag.isVeg && (
														<PlatformIcon
															ios={{
																name: 'leaf.fill',
																size: 13
															}}
															android={{
																name: 'eco',
																size: 13,
																variant: 'filled'
															}}
															web={{
																name: 'Leaf',
																size: 13,
																variant: 'filled'
															}}
															style={styles.vegIcon}
														/>
													)}

													<Text style={styles.flagsText}>{flag.name}</Text>
												</View>
											)
										)}
									</View>
									{shouldShowAllergens && (
										<View style={styles.allergensContainer}>
											<PlatformIcon
												ios={{
													name: iconName,
													size: 13
												}}
												android={{
													name: androidName,
													size: 16,
													variant: 'outlined'
												}}
												web={{
													name: webName,
													size: 16
												}}
												style={styles.icon}
											/>
											<Text style={styles.allergene} numberOfLines={3}>
												{textContent}
											</Text>
										</View>
									)}
								</View>
								<View style={styles.priceContainer}>
									<Text style={styles.price}>
										{getUserSpecificPrice(meal, userKind ?? 'guest')}
									</Text>
									{label !== '' && (
										<Text style={styles.priceLabel}>{label}</Text>
									)}
								</View>
							</View>
						</View>
					</Pressable>
				</ContextMenu>
			</DragDropView>
		)
	}
)

const stylesheet = createStyleSheet((theme) => ({
	allergene: {
		color: theme.colors.notification,
		fontSize: 12
	},
	allergensContainer: {
		alignContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		gap: 2,
		marginTop: 6,
		width: '80%'
	},
	container: {
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.mg,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		padding: theme.margins.card,
		width: '100%'
	},
	contextMenu: { zIndex: 3 },
	detailsColumns: {
		flexDirection: 'column',
		flex: 1,
		paddingTop: 2
	},
	detailsContainer: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'center',
		paddingTop: 3
	},
	flags: {
		alignContent: 'center',
		flexDirection: 'row',
		flexWrap: 'wrap'
	},
	flagsBox: {
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		alignContent: 'center',
		alignItems: 'center',
		borderRadius: theme.radius.mg,
		backgroundColor: theme.colors.labelBackground,
		flexDirection: 'row',
		marginBottom: 2,
		marginRight: 4
	},
	flagsText: {
		color: theme.colors.text,
		fontSize: 12,
		paddingHorizontal: 6,
		paddingVertical: 2
	},
	icon: {
		alignSelf: 'center',
		color: theme.colors.notification,
		marginRight: 4
	},
	vegIcon: {
		alignSelf: 'center',
		color: theme.colors.vegGreen,
		marginLeft: 7,
		marginRight: -2
	},
	innerContainer: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%'
	},
	pressable: {
		marginTop: 10
	},
	price: {
		alignSelf: 'flex-end',
		color: theme.colors.text,
		fontSize: 14,
		fontWeight: '500'
	},
	priceContainer: {
		alignItems: 'flex-end',
		alignSelf: 'flex-end',
		flexDirection: 'column',
		justifyContent: 'flex-end'
	},
	priceLabel: {
		alignSelf: 'flex-end',
		color: theme.colors.labelColor,
		fontSize: 12
	},
	title: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '500',
		maxWidth: '88%'
	},
	variantContainer: {
		borderRadius: theme.radius.mg,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth,
		backgroundColor: theme.colors.labelBackground,
		maxWidth: '10%',
		paddingHorizontal: 6,
		paddingVertical: 2
	},
	variantText: {
		color: theme.colors.text,
		fontSize: 11,
		fontWeight: '500',
		textAlign: 'center',
		textAlignVertical: 'center'
	}
}))
