export enum FeatureType {
	SCHEDULE = 'schedule',
	NAVIGATION = 'navigation',
	CANTEEN = 'canteen',
	EVENTS = 'events'
}

export interface Feature {
	icon: React.ComponentType<{ className?: string }>
	title: string
	type: FeatureType
	description: string
	color: string
	image: string
	imageDark: string
	imageAlt: string
}

export interface Testimonial {
	content: string
	author: string
	role: string
	rating: number
	delay?: number
	translated?: boolean
}

export interface TestimonialCardProps {
	testimonial: Testimonial
}
