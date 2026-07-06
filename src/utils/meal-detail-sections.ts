import { trackEvent } from '@aptabase/react-native'
import type { TFunction } from 'i18next'
import { type ColorValue, Linking, Platform, Share } from 'react-native'
import { linkIcon } from '@/components/Universal/icon'
import allergenMap from '@/data/allergens.json'
import { USER_GUEST } from '@/data/constants'
import flagMap from '@/data/mensa-flags.json'
import type { LanguageKey } from '@/localization/i18n'
import type { FormListSections } from '@/types/components'
import type { Meal, Prices } from '@/types/neuland-api'
import {
	foodDataSources,
	foodRestaurantLocations,
	formatPrice,
	humanLocations
} from '@/utils/food-utils'
import { copyToClipboard } from '@/utils/ui-utils'

export function isMealNutritionAvailable(foodData: Meal): boolean {
	return (
		foodData.nutrition != null &&
		Object.values(foodData.nutrition).every(
			(value) => value !== '' && value !== 0
		)
	)
}

export function isMensaRestaurant(
	restaurant: string | null | undefined
): boolean {
	return restaurant === 'IngolstadtMensa' || restaurant === 'NeuburgMensa'
}

interface MealDetailSectionsParams {
	foodData: Meal
	t: TFunction<'food'>
	language: LanguageKey
	userKind: string
	restaurant: string
	humanLocation: string
	locationExists: boolean
	preferencesSelection: string[]
	allergenSelection: string[]
	successColor: ColorValue | undefined
	notificationColor: ColorValue | undefined
	primaryColor: ColorValue | undefined
	onItemAlert: (item: string, itemType: 'allergen' | 'flag') => void
	onNavigateToRestaurant: () => void
}

export function buildNutritionSection(
	foodData: Meal,
	t: TFunction<'food'>
): FormListSections[] {
	return [
		{
			header: t('details.formlist.nutrition.title'),
			footer: t('details.formlist.nutrition.footer'),
			items: [
				{
					title: `${t('details.formlist.nutrition.energy')} (kJ)`,
					value: `${(foodData.nutrition?.kj ?? 'n/a').toString()} kJ`,
					copyable: `${foodData.nutrition?.kj}`
				},
				{
					title: `${t('details.formlist.nutrition.energy')} (kcal)`,
					value: `${(foodData.nutrition?.kcal ?? 'n/a').toString()} kcal`,
					copyable: `${foodData.nutrition?.kcal}`
				},
				{
					title: t('details.formlist.nutrition.fat'),
					value: `${(foodData.nutrition?.fat ?? 'n/a').toString()} g`,
					copyable: `${foodData.nutrition?.fat}`
				},
				{
					title: t('details.formlist.nutrition.saturated'),
					value: `${(foodData.nutrition?.fatSaturated ?? 'n/a').toString()} g`,
					copyable: `${foodData.nutrition?.fatSaturated}`
				},
				{
					title: t('details.formlist.nutrition.carbs'),
					value: `${(foodData.nutrition?.carbs ?? 'n/a').toString()} g`,
					copyable: `${foodData.nutrition?.carbs}`
				},
				{
					title: t('details.formlist.nutrition.sugar'),
					value: `${(foodData.nutrition?.sugar ?? 'n/a').toString()} g`,
					copyable: `${foodData.nutrition?.sugar}`
				},
				{
					title: t('details.formlist.nutrition.fiber'),
					value: `${(foodData.nutrition?.fiber ?? 'n/a').toString()} g`,
					copyable: `${foodData.nutrition?.fiber}`
				},
				{
					title: t('details.formlist.nutrition.protein'),
					value: `${(foodData.nutrition?.protein ?? 'n/a').toString()} g`,
					copyable: `${foodData.nutrition?.protein}`
				},
				{
					title: t('details.formlist.nutrition.salt'),
					value: `${(foodData.nutrition?.salt ?? 'n/a').toString()} g`,
					copyable: `${foodData.nutrition?.salt}`
				}
			]
		}
	]
}

export function buildMensaSection(
	params: MealDetailSectionsParams
): FormListSections[] {
	const {
		foodData,
		t,
		language,
		preferencesSelection,
		allergenSelection,
		successColor,
		notificationColor,
		onItemAlert
	} = params

	const nutritionSection = isMealNutritionAvailable(foodData)
		? buildNutritionSection(foodData, t)
		: []

	return [
		{
			header: t('preferences.formlist.flags'),
			items:
				foodData.flags?.map((flag: string) => ({
					title: flagMap[flag as keyof typeof flagMap]?.[language] ?? flag,
					icon: preferencesSelection.includes(flag)
						? {
								android: 'check_circle',
								ios: 'checkmark.seal',
								web: 'BadgeCheck',
								endIcon: true
							}
						: undefined,
					hideChevron: true,
					iconColor: successColor,
					onPress: () => {
						onItemAlert(flag, 'flag')
					}
				})) ?? [],
			footer: t('details.formlist.flagsFooter')
		},
		{
			header: t('preferences.formlist.allergens'),
			items:
				(foodData.allergens ?? [])
					.filter((allergen: string) =>
						Object.keys(allergenMap).includes(allergen)
					)
					.map((allergen: string) => ({
						title:
							allergenMap[allergen as keyof typeof allergenMap]?.[language] ??
							allergen,
						icon: allergenSelection.includes(allergen)
							? {
									android: 'warning',
									ios: 'exclamationmark.triangle',
									web: 'TriangleAlert',
									endIcon: true
								}
							: undefined,
						hideChevron: true,
						iconColor: notificationColor,
						onPress: () => {
							onItemAlert(allergen, 'allergen')
						}
					})) ?? [],
			footer: t('details.formlist.allergenFooter', {
				allergens: foodData.allergens?.join(', ')
			})
		},
		...nutritionSection
	]
}

export function buildAboutSection(
	params: MealDetailSectionsParams
): FormListSections[] {
	const {
		foodData,
		t,
		humanLocation,
		locationExists,
		primaryColor,
		onNavigateToRestaurant
	} = params

	const humanCategory = t(
		// @ts-expect-error cannot verify the TFunction type
		`categories.${foodData.category}`
	) as string

	return [
		{
			header: t('details.formlist.about.title'),
			items: [
				{
					title: t('labels.restaurant', { ns: 'common' }),
					value: humanLocation,
					onPress: onNavigateToRestaurant,
					textColor: locationExists ? primaryColor : undefined,
					disabled: !locationExists,
					icon: {
						ios: 'mappin.and.ellipse',
						android: 'place',
						web: 'MapPin'
					}
				},
				{
					title: t('details.formlist.about.category'),
					value: humanCategory,
					icon: {
						ios: 'tag',
						android: 'sell',
						web: 'Tag'
					}
				},
				{
					title: t('details.formlist.about.source'),
					icon: linkIcon,
					onPress: () => {
						if (foodData.restaurant !== null) {
							const restaurant =
								foodData.restaurant as keyof typeof foodDataSources
							void Linking.openURL(foodDataSources[restaurant])
						}
					}
				}
			]
		}
	]
}

export function buildVariantsSection(
	foodData: Meal,
	t: TFunction<'food'>,
	language: LanguageKey,
	userKind: string,
	restaurant: string
): FormListSections[] {
	return [
		{
			header: t('details.formlist.variants'),
			items:
				foodData.variants?.map((variant) => {
					const priceKey = (userKind ?? USER_GUEST) as keyof Prices
					return {
						title: variant.name[language],
						value:
							(variant?.additional ? '+ ' : '') +
							formatPrice(variant.prices[priceKey]),
						onPress: () => {
							trackEvent('Share', {
								type: 'mealVariant'
							})
							const message = t('details.share.message', {
								meal: variant.name[language],
								price: formatPrice(variant.prices[priceKey]),
								location: restaurant,
								id: variant?.id
							})
							if (Platform.OS === 'web') {
								void copyToClipboard(message)
								return
							}
							void Share.share({
								message
							})
						}
					}
				}) ?? []
		}
	]
}

export function buildMealDetailSections(
	params: MealDetailSectionsParams
): FormListSections[] {
	const { foodData, t, language, userKind, restaurant } = params

	const variantsSection = buildVariantsSection(
		foodData,
		t,
		language,
		userKind,
		restaurant
	)
	const aboutSection = buildAboutSection(params)

	if (isMensaRestaurant(foodData.restaurant)) {
		return [...variantsSection, ...buildMensaSection(params), ...aboutSection]
	}

	return [...variantsSection, ...aboutSection]
}

export function getMealHumanLocation(restaurant: string): string {
	return humanLocations[restaurant as keyof typeof humanLocations]
}

export function hasMealRestaurantLocation(restaurant: string): boolean {
	return (
		restaurant !== undefined &&
		foodRestaurantLocations[
			restaurant as keyof typeof foodRestaurantLocations
		] !== undefined
	)
}
