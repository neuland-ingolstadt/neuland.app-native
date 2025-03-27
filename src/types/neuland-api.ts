export interface CLEvents {
	host: ClHost
	titles: Name
	startDateTime: Date
	endDateTime: Date | null
	location: string | null
	descriptions: Name | null
}

export interface ClHost {
	name: string
	website: string
	instagram: string
}

export interface Food {
	timestamp: string | Date
	meals: Meal[]
}

export interface Meal {
	name: Name
	id: string
	category: string
	prices: Prices
	allergens: string[] | null
	flags: string[] | null
	nutrition: Nutrition | null
	variants: Variation[]
	originalLanguage: string
	static: boolean
	restaurant?: string
}

export interface Variation {
	name: Name
	additional: boolean
	prices: Prices
	id: string
}

export interface Name {
	de: string
	en: string
}

export interface Nutrition {
	kj: number
	kcal: number
	fat: number
	fatSaturated: number
	carbs: number
	sugar: number
	fiber: number
	protein: number
	salt: number
}

export enum OriginalLanguage {
	De = 'de',
	En = 'en'
}

export interface Prices {
	student: number
	employee: number
	guest: number
}
