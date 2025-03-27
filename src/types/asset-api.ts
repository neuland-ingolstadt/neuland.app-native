import type { MaterialIcon } from './material-icons'

export interface RoomsOverlay {
	type: string
	features: Feature[]
	totalFeatures: number
	numberMatched: number
	numberReturned: number
	timeStamp: Date
	crs: unknown
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
	Polygon = 'Polygon'
}

export enum GeometryName {
	Location = 'Location'
}

export interface FeatureProperties {
	fid?: number
	id?: string
	Standort: string
	Gebaeude: Gebaeude
	Etage: string
	Ebene: string
	Raum: string
	Funktion_de: string
	Funktion_en: string
	rtype?: number
	center?: number[]
	icon?: { ios: string; android: MaterialIcon }
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
	X = 'X',
	Z = 'Z'
}

export enum FeatureType {
	Feature = 'Feature'
}

interface Course {
	apo_number: string
	name: string
	weekly_workload: number | null
	weight: number | { type: string; weight: number } | null
	ects: number | null
}

export type SpoWeights = Record<string, Course[]>

export type RoomDistances = Record<string, Record<string, number>>
