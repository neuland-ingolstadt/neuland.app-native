import { Calendar, MapPin, Users, Utensils } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslations'
import { type Feature, FeatureType } from './types'

export function useFeatures() {
	const { t } = useTranslation()

	const features: Feature[] = [
		{
			icon: Calendar,
			title: t('features.details.schedule.title'),
			type: FeatureType.SCHEDULE,
			description: t('features.details.schedule.description'),
			color: 'from-blue-500/20 to-indigo-500/20',
			image: '/assets/calendar.webp',
			imageDark: '/assets/calendar_dark.webp',
			imageAlt: t('features.details.schedule.title')
		},
		{
			icon: MapPin,
			title: t('features.details.navigation.title'),
			type: FeatureType.NAVIGATION,
			description: t('features.details.navigation.description'),
			color: 'from-cyan-500/20 to-blue-500/20',
			image: '/assets/map.webp',
			imageDark: '/assets/map_dark.webp',
			imageAlt: t('features.details.navigation.title')
		},
		{
			icon: Utensils,
			title: t('features.details.canteen.title'),
			type: FeatureType.CANTEEN,
			description: t('features.details.canteen.description'),
			color: 'from-orange-500/20 to-red-500/20',
			image: '/assets/food.webp',
			imageDark: '/assets/food_dark.webp',
			imageAlt: t('features.details.canteen.title')
		},
		{
			icon: Users,
			title: t('features.details.events.title'),
			type: FeatureType.EVENTS,
			description: t('features.details.events.description'),
			color: 'from-purple-500/20 to-pink-500/20',
			image: '/assets/sports.webp',
			imageDark: '/assets/sports_dark.webp',
			imageAlt: t('features.details.events.title')
		}
	]

	const easterEggMessages = {
		[FeatureType.SCHEDULE]: t('features.easterEggs.schedule'),
		[FeatureType.NAVIGATION]: t('features.easterEggs.navigation'),
		[FeatureType.CANTEEN]: t('features.easterEggs.canteen'),
		[FeatureType.EVENTS]: t('features.easterEggs.events')
	}

	const featureDetails = {
		[FeatureType.SCHEDULE]: {
			title: t('features.details.title'),
			items: t('features.details.schedule.items') as unknown as string[]
		},
		[FeatureType.NAVIGATION]: {
			title: t('features.details.title'),
			items: t('features.details.navigation.items') as unknown as string[]
		},
		[FeatureType.CANTEEN]: {
			title: t('features.details.title'),
			items: t('features.details.canteen.items') as unknown as string[]
		},
		[FeatureType.EVENTS]: {
			title: t('features.details.title'),
			items: t('features.details.events.items') as unknown as string[]
		}
	}

	return { features, easterEggMessages, featureDetails }
}
