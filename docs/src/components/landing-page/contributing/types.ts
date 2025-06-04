import type { LucideIcon } from 'lucide-react'

export interface ContributingCard {
	icon: LucideIcon
	title: string
	description: string
	gradient: string
	delay: number
}

export interface ContributingButton {
	href: string
	icon: LucideIcon
	label: string
	variant?: 'default' | 'outline'
}
