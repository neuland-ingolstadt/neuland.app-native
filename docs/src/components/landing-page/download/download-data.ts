'use client'
import { Globe } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslations'
import type { DownloadOption } from './types'

export function useDownloadOptions() {
	const { t, lang } = useTranslation()
	const badgeSuffix = lang === 'de' ? 'DE' : 'EN'

	const downloadOptions: DownloadOption[] = [
		{
			title: t('download.options.appStore.title'),
			description: t('download.options.appStore.description'),
			href: 'https://apps.apple.com/de/app/neuland-next/id1617096811',
			imageSrc: `/assets/Apple_Badge_${badgeSuffix}.svg`,
			imageAlt: t('download.options.appStore.imageAlt'),
			gradientColors: {
				from: 'from-blue-500/30',
				to: 'to-purple-500/30'
			}
		},
		{
			title: t('download.options.googlePlay.title'),
			description: t('download.options.googlePlay.description'),
			href: 'https://play.google.com/store/apps/details?id=app.neuland',
			imageSrc: `/assets/Google_Badge_${badgeSuffix}.svg`,
			imageAlt: t('download.options.googlePlay.imageAlt'),
			gradientColors: {
				from: 'from-green-500/30',
				to: 'to-emerald-500/30'
			}
		},
		{
			title: t('download.options.webVersion.title'),
			description: t('download.options.webVersion.description'),
			href: 'https://web.neuland.app',
			icon: Globe,
			gradientColors: {
				from: 'from-orange-500/30',
				to: 'to-red-500/30'
			}
		}
	]

	return downloadOptions
}
