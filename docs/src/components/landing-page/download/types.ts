import type { LucideIcon } from 'lucide-react'

export interface DownloadOption {
	title: string
	description: string
	href: string
	icon?: LucideIcon
	imageSrc?: string
	imageAlt?: string
	gradientColors: {
		from: string
		to: string
	}
}

export interface DownloadCardProps {
	option: DownloadOption
}
