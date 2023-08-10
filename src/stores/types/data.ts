export interface Allergens {
    de: string
    en: string
}

export interface Calendar {
    name: LanguageClass | string
    begin: string
    comments?: string[]
    end?: Date
    hasHours?: boolean
}

export interface LanguageClass {
    de: string
    en: string
}

export interface Clubs {
    club: string
    instagram: string
    website: string
}

export interface CourseShortNames {
    'Business School': string[]
    'Elektro- und Informationstechnik': string[]
    'Institut für Akademische Weiterbildung': string[]
    Informatik: string[]
    Maschinenbau: string[]
    Wirtschaftsingenieurwesen: string[]
}

export interface CanteenFlags {
    _source: LanguageClass
    B: LanguageClass
    CO2: LanguageClass
    F: LanguageClass
    G: LanguageClass
    Gf: LanguageClass
    L: LanguageClass
    MSC: LanguageClass
    MV: LanguageClass
    R: LanguageClass
    S: LanguageClass
    V: LanguageClass
    W: LanguageClass
    veg: LanguageClass
    TODO0: LanguageClass
    TODO1: LanguageClass
}

export interface CanteenAllergens {
    '1': LanguageClass
    '2': LanguageClass
    '4': LanguageClass
    '5': LanguageClass
    '7': LanguageClass
    '8': LanguageClass
    '9': LanguageClass
    '10': LanguageClass
    '12': LanguageClass
    '13': LanguageClass
    '30': LanguageClass
    _source: LanguageClass
    Wz: LanguageClass
    Gf: LanguageClass
    Ro: LanguageClass
    Ge: LanguageClass
    Hf: LanguageClass
    Kr: LanguageClass
    Ei: LanguageClass
    Fi: LanguageClass
    Er: LanguageClass
    So: LanguageClass
    Mi: LanguageClass
    Man: LanguageClass
    Hs: LanguageClass
    Wa: LanguageClass
    Ka: LanguageClass
    Pe: LanguageClass
    Pa: LanguageClass
    Pi: LanguageClass
    Mac: LanguageClass
    Sel: LanguageClass
    Sen: LanguageClass
    Ses: LanguageClass
    Su: LanguageClass
    Lu: LanguageClass
    We: LanguageClass
}

export interface Mobility {
    bus: Bus
    train: Train
    parking: Parking[]
    charging: Charging[]
}

export interface Bus {
    defaultStation: string
    stations: BusStation[]
}

export interface BusStation {
    id: string
    name: string
    url: string
}

export interface Charging {
    id: string
    freeParking: boolean
}

export interface Parking {
    name: string
    priceLevel: number | string
}

export interface Train {
    defaultStation: string
    stations: TrainStation[]
}

export interface TrainStation {
    id: string
    name: string
}

export interface RoomPlan {
    type: string
    features: Feature[]
    totalFeatures: number
    numberMatched: number
    numberReturned: number
    timeStamp: Date
    crs: CRS
}

export interface CRS {
    type: string
    properties: CRSProperties
}

export interface CRSProperties {
    name: string
}

export interface Feature {
    coordinates: any
    type: FeatureType
    id: string
    geometry: Geometry | null
    geometry_name?: GeometryName
    properties: FeatureProperties
}

export interface Geometry {
    type: GeometryType
    coordinates: number[][][]
}

export enum GeometryType {
    Polygon = 'Polygon',
}

export enum GeometryName {
    Location = 'Location',
}

export interface FeatureProperties {
    Standort: Standort
    Gebaeude: Gebaeude
    Etage: null | string
    Ebene: null | string
    Raum: string
    Funktion: null | string
}

export enum Gebaeude {
    A = 'A',
    B = 'B',
    Bn = 'BN',
    C = 'C',
    CN = 'CN',
    D = 'D',
    E = 'E',
    F = 'F',
    G = 'G',
    H = 'H',
    I = 'I',
    J = 'J',
    K = 'K',
    M = 'M',
    N = 'N',
    P = 'P',
    S = 'S',
    W = 'W',
    Z = 'Z',
}

export enum Standort {
    In = 'IN',
    Nd = 'ND',
}

export enum FeatureType {
    Feature = 'Feature',
}
