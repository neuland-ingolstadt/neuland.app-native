import type React from 'react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import type { Food, Meal } from '@/types/neuland-api'
import { toColor } from '@/utils/uniwind-utils'
import { EmptyFoodAnimation } from './empty-food-animation'

import { MealEntry } from './meal-entry'

const sortCategoriesByPriority = (categories: string[]): string[] => {
	const categoryPriority: Record<string, number> = {
		main: 1,
		side: 2,
		dessert: 3,
		soup: 4
	}

	return [...categories].sort((a, b) => {
		const priorityA = categoryPriority[a] || 10
		const priorityB = categoryPriority[b] || 10

		if (priorityA === priorityB) {
			return a.localeCompare(b)
		}
		return priorityA - priorityB
	})
}

const MealGroup = ({
	group
}: {
	group: Record<string, Meal[]>
}): React.JSX.Element => {
	const sortedCategories = sortCategoriesByPriority(Object.keys(group))

	return (
		<>
			{sortedCategories.map((key) => (
				<MealCategory key={key} category={key} meals={group[key]} />
			))}
		</>
	)
}

const MealCategory = ({
	category,
	meals
}: {
	category: string
	meals: Meal[]
}): React.JSX.Element => {
	const [collapsed, setCollapsed] = useState(false)
	const { t } = useTranslation('food')
	const primaryColor = toColor(useCSSVariable('--color-primary'))

	const toggleCollapsed = (): void => {
		setCollapsed(!collapsed)
	}

	return (
		<View key={category} className="pb-2">
			<Pressable
				onPress={() => {
					toggleCollapsed()
				}}
				className="active:opacity-80"
				hitSlop={{ top: 6, bottom: 6 }}
			>
				<View className="flex-row items-center justify-between py-[3px]">
					<Text className="text-label text-[15px] font-medium">
						{t(`categories.${category}`, category)}
					</Text>
					<PlatformIcon
						ios={{
							name: collapsed ? 'chevron.down' : 'chevron.up',
							size: 13,
							weight: 'semibold'
						}}
						android={{
							name: collapsed ? 'expand_more' : 'expand_less',
							size: 20
						}}
						web={{
							name: collapsed ? 'ChevronDown' : 'ChevronUp',
							size: 20
						}}
						style={{ color: primaryColor, alignSelf: 'center', marginRight: 4 }}
					/>
				</View>
			</Pressable>
			<Collapsible collapsed={collapsed}>
				{meals.map((meal: Meal) => (
					<MealEntry key={meal.id} meal={meal} />
				))}
			</Collapsible>
		</View>
	)
}

const filterMealsByRestaurant = (meals: Meal[], restaurant: string): Meal[] => {
	return meals.filter((meal: Meal) => meal.restaurant === restaurant)
}

const groupMealsByCategory = (meals: Meal[]): Record<string, Meal[]> => {
	return meals.reduce((r: Record<string, Meal[]>, a: Meal) => {
		const category = a.category
		if (Object.hasOwn(r, category)) {
			r[category].push(a)
		} else {
			r[category] = [a]
		}
		return r
	}, {})
}

interface RestaurantViewProps {
	restaurantName: string
	meals: Meal[]
	groupedMeals: Record<string, Meal[]>
}

const RestaurantView = ({
	restaurantName,
	meals,
	groupedMeals
}: RestaurantViewProps): React.JSX.Element | null => {
	if (meals.length === 0) {
		return null
	}

	return (
		<View>
			<Text className="text-text text-lg font-bold pb-[3px] pt-3">
				{restaurantName}
			</Text>
			<MealGroup group={groupedMeals} />
		</View>
	)
}

export const MealDay = ({ day }: { day: Food }): React.JSX.Element => {
	const mealData = useMemo(() => {
		const ingolstadtMensa = filterMealsByRestaurant(
			day.meals,
			'IngolstadtMensa'
		)
		const neuburgMensa = filterMealsByRestaurant(day.meals, 'NeuburgMensa')
		const reimanns = filterMealsByRestaurant(day.meals, 'Reimanns')
		const canisius = filterMealsByRestaurant(day.meals, 'Canisius')

		return {
			ingolstadtMensa,
			neuburgMensa,
			reimanns,
			canisius,
			ingolstadtMensaGrouped: groupMealsByCategory(ingolstadtMensa),
			neuburgMensaGrouped: groupMealsByCategory(neuburgMensa),
			reimannsGrouped: groupMealsByCategory(reimanns),
			canisiusGrouped: groupMealsByCategory(canisius),
			isEmpty:
				ingolstadtMensa.length === 0 &&
				reimanns.length === 0 &&
				canisius.length === 0 &&
				neuburgMensa.length === 0
		}
	}, [day.meals])

	return mealData.isEmpty ? (
		<EmptyFoodAnimation />
	) : (
		<View className="pb-bottom-safe">
			<RestaurantView
				restaurantName="Mensa Ingolstadt"
				meals={mealData.ingolstadtMensa}
				groupedMeals={mealData.ingolstadtMensaGrouped}
			/>
			<RestaurantView
				restaurantName="Theke Neuburg"
				meals={mealData.neuburgMensa}
				groupedMeals={mealData.neuburgMensaGrouped}
			/>
			<RestaurantView
				restaurantName="Reimanns"
				meals={mealData.reimanns}
				groupedMeals={mealData.reimannsGrouped}
			/>
			<RestaurantView
				restaurantName="Canisius Konvikt"
				meals={mealData.canisius}
				groupedMeals={mealData.canisiusGrouped}
			/>
		</View>
	)
}
