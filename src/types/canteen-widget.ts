export type CanteenWidgetMeal = {
	name: string
	price: string
}

export type CanteenWidgetRestaurant = {
	id: string
	title: string
	meals: CanteenWidgetMeal[]
}

export type CanteenWidgetProps = {
	dateLabel: string
	emptyLabel: string
	restaurants: CanteenWidgetRestaurant[]
}

export type CanteenWidgetConfiguration = {
	restaurant: string
}
