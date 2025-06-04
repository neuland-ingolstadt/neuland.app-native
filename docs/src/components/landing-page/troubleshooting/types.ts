import type { LucideIcon } from 'lucide-react'

export interface TroubleshootingCard {
	icon: LucideIcon
	title: string
	description: string
	gradient: string
	delay: number
	link: string
	animationDirection: 'left' | 'right'
	hoverRotation: number
}
