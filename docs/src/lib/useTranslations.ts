'use client'
import { useParams } from 'next/navigation'
import de from '@/localization/de.json'
import en from '@/localization/en.json'

const translations = {
	en,
	de
} as const

export function useTranslation() {
	const { lang } = useParams()
	const currentLang = (lang as keyof typeof translations) || 'en'

	const t = (key: string): string => {
		const keys = key.split('.')
		let value: unknown = translations[currentLang]

		for (const k of keys) {
			if (value && typeof value === 'object') {
				value = (value as Record<string, unknown>)[k]
			} else {
				value = undefined
				break
			}
		}

		if (!value && currentLang !== 'en') {
			let fallbackValue: unknown = translations.en
			for (const k of keys) {
				if (fallbackValue && typeof fallbackValue === 'object') {
					fallbackValue = (fallbackValue as Record<string, unknown>)[k]
				} else {
					fallbackValue = undefined
					break
				}
			}
			return (fallbackValue as string) || key
		}

		return (value as string) || key
	}

	return { t, lang: currentLang }
}
