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
    begin: Date | null
    end: Date | null
    location: string | null
    description: string | null
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

export interface Announcement {
    id: string
    title: {
        de: string
        en: string
    }
    description: {
        de: string
        en: string
    }
    startDateTime: number
    endDateTime: number
    priority: number
    url: string | null
}

export interface UniversitySports {
    id: string
    title: {
        de: string
        en: string
    }
    description: {
        de: string
        en: string
    }
    campus: string
    location: string
    weekday: string
    startTime: string
    endTime: string
    requiresRegistration: boolean
    invitationLink: string | null
    eMail: string | null
}

export interface GetUniversitySportsData {
    universitySports: UniversitySports[]
}
