import type { LucideIcon } from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'

export interface FoodIcon {
	ios: string
	android: MaterialIcon
	web: LucideIcon
	delay: number
	position: { x: number; y: number }
}

export const FOOD_ICONS: readonly FoodIcon[] = [
	{
		ios: 'carrot',
		android: 'ramen_dining',
		web: 'Ham',
		delay: 0,
		position: { x: 0.8, y: -0.6 }
	},
	{
		ios: 'takeoutbag.and.cup.and.straw',
		android: 'lunch_dining',
		web: 'Pizza',
		delay: 400,
		position: { x: -0.85, y: -0.45 }
	},
	{
		ios: 'cup.and.saucer',
		android: 'coffee',
		web: 'Coffee',
		delay: 800,
		position: { x: 0.45, y: 0.9 }
	}
]
