import type { LucideIcon } from 'lucide-react'

export enum FeatureType {
	SCHEDULE = 'SCHEDULE',
	NAVIGATION = 'NAVIGATION',
	CANTEEN = 'CANTEEN',
	EVENTS = 'EVENTS'
}

export interface Feature {
	icon: LucideIcon
	title: string
	type: FeatureType
	description: string
	color: string
	image: string
	imageDark: string
	imageAlt: string
}

export interface FeatureImageCardProps {
	icon: LucideIcon
	title: string
	description: string
	buttonLabel: string
	image: string
	imageDark: string
	imageAlt: string
	type: FeatureType
	onButtonClick?: () => void
}
