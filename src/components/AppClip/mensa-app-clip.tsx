import { getLocales } from 'expo-localization'
import type React from 'react'
import { useEffect, useState } from 'react'
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { recommendFullApp } from '@/utils/app-clip'
import {
	fetchTodayMensaMeals,
	type MensaClipMeal
} from '@/utils/mensa-clip-api'

const RESTAURANT_LABELS: Record<string, string> = {
	IngolstadtMensa: 'Mensa Ingolstadt',
	Reimanns: 'Reimanns',
	NeuburgMensa: 'Mensa Neuburg',
	Canisius: 'Canisius'
}

function groupByRestaurant(
	meals: MensaClipMeal[]
): Record<string, MensaClipMeal[]> {
	return meals.reduce<Record<string, MensaClipMeal[]>>((groups, meal) => {
		const key = meal.restaurant
		if (groups[key] == null) {
			groups[key] = []
		}
		groups[key].push(meal)
		return groups
	}, {})
}

/**
 * Lightweight Mensa experience for the iOS App Clip.
 */
export default function MensaAppClip(): React.JSX.Element {
	const language = getLocales()[0]?.languageCode === 'en' ? 'en' : 'de'
	const [meals, setMeals] = useState<MensaClipMeal[] | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false

		const load = async (): Promise<void> => {
			try {
				const nextMeals = await fetchTodayMensaMeals(language)
				if (!cancelled) {
					setMeals(nextMeals)
					setError(null)
				}
			} catch {
				if (!cancelled) {
					setError(
						language === 'de'
							? 'Speiseplan konnte nicht geladen werden.'
							: "Could not load today's menu."
					)
				}
			} finally {
				if (!cancelled) {
					setLoading(false)
				}
			}
		}

		void load()
		return () => {
			cancelled = true
		}
	}, [language])

	useEffect(() => {
		if (loading) {
			return
		}
		const timer = setTimeout(() => {
			recommendFullApp()
		}, 1500)
		return () => {
			clearTimeout(timer)
		}
	}, [loading])

	const grouped = meals == null ? {} : groupByRestaurant(meals)
	const title = language === 'de' ? 'Mensa heute' : 'Canteen today'
	const subtitle =
		language === 'de'
			? 'Schnellansicht aus Neuland Next'
			: 'Quick view from Neuland Next'
	const empty =
		language === 'de' ? 'Heute keine Gerichte.' : 'No meals for today.'
	const cta =
		language === 'de'
			? 'Volle App laden – Stundenplan, Karte & mehr'
			: 'Get the full app – timetable, map & more'
	const ctaHint =
		language === 'de'
			? 'Für Login, Filter und alle Campus-Features'
			: 'For login, filters, and all campus features'

	return (
		<SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
			<ScrollView
				contentContainerClassName="p-page gap-4 pb-8"
				showsVerticalScrollIndicator={false}
			>
				<View className="gap-1">
					<Text className="text-text text-2xl font-bold">{title}</Text>
					<Text className="text-label text-sm">{subtitle}</Text>
				</View>

				{loading ? (
					<View className="items-center justify-center py-16">
						<ActivityIndicator />
					</View>
				) : error != null ? (
					<Text className="text-label text-base">{error}</Text>
				) : meals == null || meals.length === 0 ? (
					<Text className="text-label text-base">{empty}</Text>
				) : (
					Object.entries(grouped).map(([restaurant, restaurantMeals]) => (
						<View key={restaurant} className="gap-2">
							<Text className="text-text text-lg font-semibold">
								{RESTAURANT_LABELS[restaurant] ?? restaurant}
							</Text>
							<View className="bg-card rounded-lg border border-border overflow-hidden">
								{restaurantMeals.map((meal, index) => (
									<View
										key={`${meal.name}-${String(index)}`}
										className={`px-3 py-3 gap-0.5 ${
											index > 0 ? 'border-t border-border' : ''
										}`}
									>
										<Text className="text-text text-[15px] font-medium">
											{meal.name}
										</Text>
										<View className="flex-row justify-between">
											<Text className="text-label text-sm capitalize">
												{meal.category}
											</Text>
											{meal.price !== '' ? (
												<Text className="text-label text-sm tabular-nums">
													{meal.price}
												</Text>
											) : null}
										</View>
									</View>
								))}
							</View>
						</View>
					))
				)}

				<View className="gap-2 mt-2">
					<Pressable
						accessibilityRole="button"
						className="bg-primary rounded-lg px-4 py-3.5 items-center active:opacity-80"
						onPress={() => {
							recommendFullApp()
						}}
					>
						<Text className="text-white text-[15px] font-semibold text-center">
							{cta}
						</Text>
					</Pressable>
					<Text className="text-label text-xs text-center">{ctaHint}</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
