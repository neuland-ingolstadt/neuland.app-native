import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui'
import {
	containerBackground,
	font,
	foregroundStyle,
	padding
} from '@expo/ui/swift-ui/modifiers'
import { createWidget, type WidgetEnvironment } from 'expo-widgets'
import type {
	CanteenWidgetConfiguration,
	CanteenWidgetProps
} from '@/types/canteen-widget'

const CanteenWidget = (
	props: CanteenWidgetProps,
	environment: WidgetEnvironment<CanteenWidgetConfiguration>
): React.JSX.Element => {
	'widget'

	const restaurants = props.restaurants ?? []
	const configuredId = environment.configuration?.restaurant
	const selected =
		restaurants.find((restaurant) => restaurant.id === configuredId) ??
		restaurants[0]

	const isSmall = environment.widgetFamily === 'systemSmall'
	const isLarge =
		environment.widgetFamily === 'systemLarge' ||
		environment.widgetFamily === 'systemExtraLarge'
	const mealLimit = isSmall ? 2 : isLarge ? 6 : 4
	const meals = (selected?.meals ?? []).slice(0, mealLimit)
	const isDark = environment.colorScheme === 'dark'
	const primaryText = isDark ? '#F5F5F5' : '#111111'
	const secondaryText = isDark ? '#A3A3A3' : '#525252'
	const title = selected?.title ?? 'Mensa'
	const dateLabel = props.dateLabel ?? ''
	const emptyLabel = props.emptyLabel ?? 'No meals available'

	return (
		<VStack
			alignment="leading"
			spacing={6}
			modifiers={[
				padding({ all: 14 }),
				containerBackground('secondarySystemBackground', 'widget')
			]}
		>
			<VStack alignment="leading" spacing={2}>
				<Text
					modifiers={[
						font({ weight: 'semibold', size: isSmall ? 13 : 15 }),
						foregroundStyle(primaryText)
					]}
				>
					{title}
				</Text>
				{dateLabel !== '' ? (
					<Text
						modifiers={[
							font({ size: isSmall ? 11 : 12 }),
							foregroundStyle(secondaryText)
						]}
					>
						{dateLabel}
					</Text>
				) : null}
			</VStack>

			{meals.length === 0 ? (
				<Text modifiers={[font({ size: 13 }), foregroundStyle(secondaryText)]}>
					{emptyLabel}
				</Text>
			) : (
				<VStack alignment="leading" spacing={4}>
					{meals.map((meal) => (
						<HStack key={meal.name} spacing={8} alignment="top">
							<Text
								modifiers={[
									font({ size: isSmall ? 12 : 13 }),
									foregroundStyle(primaryText)
								]}
							>
								{meal.name}
							</Text>
							<Spacer />
							{meal.price !== '' ? (
								<Text
									modifiers={[
										font({ weight: 'medium', size: isSmall ? 12 : 13 }),
										foregroundStyle(secondaryText)
									]}
								>
									{meal.price}
								</Text>
							) : null}
						</HStack>
					))}
				</VStack>
			)}
		</VStack>
	)
}

export default createWidget<CanteenWidgetProps, CanteenWidgetConfiguration>(
	'CanteenWidget',
	CanteenWidget,
	{
		dateLabel: '',
		emptyLabel: "Open Neuland Next to load today's menu.",
		restaurants: []
	}
)
