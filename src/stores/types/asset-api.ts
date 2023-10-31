export interface RoomsOverlay {
    type: string
    features: Feature[]
    totalFeatures: number
    numberMatched: number
    numberReturned: number
    timeStamp: Date
    crs: any
    bbox: number[]
}

export interface Feature {
    type: FeatureType
    properties: FeatureProperties
    geometry: Geometry | null
    id?: number | string
    bbox?: number[]
    geometry_name?: GeometryName
}

export interface Geometry {
    type: GeometryType
    coordinates: number[][][]
    bbox?: number[]
}

export enum GeometryType {
    Polygon = 'Polygon',
}

export enum GeometryName {
    Location = 'Location',
}

export interface FeatureProperties {
    fid?: number
    id?: string
    Standort: string
    Gebaeude: Gebaeude
    Etage: string
    Ebene: string
    Raum: string
    Funktion: string
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

export enum FeatureType {
    Feature = 'Feature',
}
