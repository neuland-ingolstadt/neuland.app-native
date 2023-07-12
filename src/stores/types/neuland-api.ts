export interface Parking {
    name: string
    available: number
}

export interface Charging {
    id: string
    name: string
    address: string
    city: string
    latitude: string
    longitude: string
    available: number
    total: number
}

export interface CLEvents {
    id: string
    organizer: string
    title: string
    begin: Date
    end: Date
}

export interface Food {
    timestamp: string | Date
    meals: Meal[]
}

export interface Meal {
    name: Name
    category: Category
    prices: Prices
    allergens: string[] | null
    flags: string[] | null
    nutrition: Nutrition | null
    originalLanguage: OriginalLanguage
    restaurant?: string
}

export enum Category {
    Essen = 'Essen',
    Salat = 'Salat',
    Suppe = 'Suppe',
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
    En = 'en',
}

export interface Prices {
    student: number
    employee: number
    guest: number
}

export interface Train {
    name: string
    destination: string
    plannedTime: Date
    actualTime: Date
    canceled: boolean
    plattform: number | null
    url: string
}

export interface Bus {
    route: string
    destination: string
    time: Date
}
