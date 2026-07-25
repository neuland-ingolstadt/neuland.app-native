import type { TFunction } from 'i18next'
import { Alert, Platform } from 'react-native'
import allergenMap from '@/data/allergens.json'
import flagMap from '@/data/mensa-flags.json'
import type { LanguageKey } from '@/localization/i18n'

export interface MealPreferenceAlertParams {
	t: TFunction<'food'>
	language: LanguageKey
	allergenSelection: string[]
	preferencesSelection: string[]
	toggleSelectedAllergens: (item: string) => void
	toggleSelectedPreferences: (item: string) => void
}

export function createMealPreferenceAlert(
	params: MealPreferenceAlertParams
): (item: string, itemType: 'allergen' | 'flag') => void {
	const {
		t,
		language,
		allergenSelection,
		preferencesSelection,
		toggleSelectedAllergens,
		toggleSelectedPreferences
	} = params

	return (item: string, itemType: 'allergen' | 'flag'): void => {
		const itemMap = itemType === 'allergen' ? allergenMap : flagMap
		const friendlyItem =
			itemMap[item as keyof typeof itemMap]?.[language] ?? item
		const isItemSelected = (
			itemType === 'allergen' ? allergenSelection : preferencesSelection
		).includes(item)

		if (Platform.OS === 'web') {
			if (
				!window.confirm(
					isItemSelected
						? t(
								// @ts-expect-error cannot verify the TFunktion type
								`details.formlist.alert.${itemType}.message.remove`,
								{
									[itemType]: friendlyItem
								}
							)
						: t(
								// @ts-expect-error cannot verify the TFunktion type
								`details.formlist.alert.${itemType}.message.add`,
								{
									[itemType]: friendlyItem
								}
							)
				)
			) {
				/* empty */
			} else {
				if (itemType === 'allergen') {
					toggleSelectedAllergens(item)
				} else if (itemType === 'flag') {
					toggleSelectedPreferences(item)
				}
			}
		} else {
			Alert.alert(
				t(`details.formlist.alert.${itemType}.title`),
				isItemSelected
					? t(
							// @ts-expect-error cannot verify the TFunktion type
							`details.formlist.alert.${itemType}.message.remove`,
							{
								[itemType]: friendlyItem
							}
						)
					: t(
							// @ts-expect-error cannot verify the TFunktion type
							`details.formlist.alert.${itemType}.message.add`,
							{
								[itemType]: friendlyItem
							}
						),
				[
					{
						text: t('misc.confirm', { ns: 'common' }),
						onPress: () => {
							if (itemType === 'allergen') {
								toggleSelectedAllergens(item)
							} else if (itemType === 'flag') {
								toggleSelectedPreferences(item)
							}
						}
					},
					{
						text: t('misc.cancel', { ns: 'common' }),
						onPress: () => {
							/* empty */
						},
						style: 'cancel'
					}
				]
			)
		}
	}
}
