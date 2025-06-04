import { useTranslation } from '@/lib/useTranslations'
import type { FAQ } from './types'

interface FAQTranslation {
	question: string
	answer: string
}

export function useFAQs() {
	const { t } = useTranslation()

	const faqs: FAQ[] = (t('faq.questions') as unknown as FAQTranslation[]).map(
		(faq) => ({
			question: faq.question,
			answer: faq.answer
		})
	)

	return faqs
}
