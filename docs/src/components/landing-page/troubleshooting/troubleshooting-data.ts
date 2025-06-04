'use client'

import { AlertTriangle, Bug, LifeBuoy, MessageCircle } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslations'
import type { TroubleshootingCard } from './types'

export function useTroubleshootingCards() {
	const { t } = useTranslation()

	const cards: TroubleshootingCard[] = [
		{
			icon: LifeBuoy,
			title: t('troubleshooting.cards.help.title'),
			description: t('troubleshooting.cards.help.description'),
			gradient: 'from-orange-500/20 to-red-500/20',
			delay: 0.2,
			link: '/docs/app/troubleshoot',
			animationDirection: 'left',
			hoverRotation: -5
		},
		{
			icon: MessageCircle,
			title: t('troubleshooting.cards.support.title'),
			description: t('troubleshooting.cards.support.description'),
			gradient: 'from-orange-500/20 to-red-500/20',
			delay: 0.3,
			link: 'mailto:feedback@neuland.app',
			animationDirection: 'left',
			hoverRotation: -5
		},
		{
			icon: Bug,
			title: t('troubleshooting.cards.bugs.title'),
			description: t('troubleshooting.cards.bugs.description'),
			gradient: 'from-orange-500/20 to-red-500/20',
			delay: 0.4,
			link: 'mailto:feedback@neuland.app',
			animationDirection: 'left',
			hoverRotation: -5
		},
		{
			icon: AlertTriangle,
			title: t('troubleshooting.cards.status.title'),
			description: t('troubleshooting.cards.status.description'),
			gradient: 'from-orange-500/20 to-red-500/20',
			delay: 0.5,
			link: 'https://status.neuland.app',
			animationDirection: 'left',
			hoverRotation: -5
		}
	]

	return cards
}
