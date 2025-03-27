import Divider from '@/components/Universal/Divider'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import type { LanguageKey } from '@/localization/i18n'
import { formatISODate } from '@/utils/date-utils'
import {
	getUserSpecificPrice,
	humanLocations,
	loadFoodEntries,
	mealName,
	userMealRating
} from '@/utils/food-utils'
import { useQuery } from '@tanstack/react-query'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import BaseCard from './BaseCard'

const FoodCard = (): React.JSX.Element => {
	const { t, i18n } = useTranslation('food')
	const { styles, theme } = useStyles(stylesheet)

	const selectedRestaurants = useFoodFilterStore(
		(state) => state.selectedRestaurants
	)
	const allergenSelection = useFoodFilterStore(
		(state) => state.allergenSelection
	)
	const preferencesSelection = useFoodFilterStore(
		(state) => state.preferencesSelection
	)
	const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)

	const { userKind = USER_GUEST } = useContext(UserKindContext)
	const [foodEntries, setFoodEntries] = useState<
		{ name: string; price: string | null; location: string | null }[]
	>([])
	const { data, isSuccess } = useQuery({
		queryKey: ['meals', selectedRestaurants, false],
		queryFn: async () => await loadFoodEntries(selectedRestaurants, false),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24 // 24 hourss
	})

	useEffect(() => {
		if (!isSuccess) {
			// if data is not loaded yet, do nothing
			return
		}
		const today = formatISODate(new Date())
		const todayEntries = data
			.find((x) => x.timestamp === today)
			?.meals.filter(
				(x) =>
					x.prices.student != null && // some meals have no price. checking for one price is enough
					x.category !== 'soup' &&
					x.category !== 'salad' &&
					x.restaurant != null &&
					selectedRestaurants.includes(x.restaurant)
			)

		// Calculate userMealRating and update foodEntries
		const updateFoodEntries = (): void => {
			if (todayEntries == null) {
				setFoodEntries([])
			} else {
				todayEntries?.sort(
					(a, b) =>
						userMealRating(b, allergenSelection, preferencesSelection) -
						userMealRating(a, allergenSelection, preferencesSelection)
				)
				const shownEntries = todayEntries.slice(0, 2)
				const hiddenEntriesCount = todayEntries.length - shownEntries.length
				setFoodEntries([
					...shownEntries.map((x) => ({
						name: mealName(x.name, foodLanguage, i18n.language as LanguageKey),
						price: getUserSpecificPrice(x, userKind ?? USER_GUEST),
						location: x.restaurant ?? null
					})),
					...(hiddenEntriesCount > 0
						? [
								{
									name:
										hiddenEntriesCount === 1
											? t('dashboard.oneMore')
											: t('dashboard.manyMore', {
													count: hiddenEntriesCount
												}),
									price: null,
									location: null
								}
							]
						: [])
				])
			}
		}

		updateFoodEntries()
	}, [
		allergenSelection,
		preferencesSelection,
		data,
		foodLanguage,
		i18n.language,
		userKind
	])

	return (
		<BaseCard title={'food'} onPressRoute="/food">
			{Boolean(isSuccess) && data !== undefined && data.length > 0 && (
				<View style={styles.listView}>
					{foodEntries.length === 0 && (
						<Text style={styles.emptyMenu}>{t('dashboard.empty')}</Text>
					)}
					{foodEntries.map((meal, index) => (
						<React.Fragment key={index}>
							<View style={styles.mealEntry}>
								<Text style={styles.mealTitle} numberOfLines={2}>
									{meal.name}
								</Text>
								{meal.price != null && (
									<Text style={styles.mealPrice} numberOfLines={1}>
										{meal.price}
										{meal.location != null &&
											` - ${humanLocations[meal.location as keyof typeof humanLocations]}`}
									</Text>
								)}
							</View>
							{foodEntries.length - 1 !== index && (
								<Divider color={theme.colors.border} width={'100%'} />
							)}
						</React.Fragment>
					))}
				</View>
			)}
		</BaseCard>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	emptyMenu: {
		color: theme.colors.labelColor,
		fontSize: 16,
		fontWeight: '500'
	},
	listView: {
		gap: 8,
		paddingTop: 12
	},
	mealEntry: {
		flexDirection: 'column',
		gap: 4
	},
	mealPrice: {
		color: theme.colors.labelColor,
		fontSize: 15,
		textAlign: 'left'
	},
	mealTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '500'
	}
}))

export default FoodCard
