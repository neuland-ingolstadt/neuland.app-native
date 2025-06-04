import { useTranslation } from '@/lib/useTranslations'
import type { Testimonial } from './types'

interface ReviewTranslation {
	content: string
	author: string
	role: string
	translated: boolean
}

export function useTestimonials() {
	const { t } = useTranslation()

	const testimonials: Testimonial[] = (
		t('testimonials.reviews') as unknown as ReviewTranslation[]
	).map((review) => ({
		content: review.content,
		author: review.author,
		role: review.role,
		rating: 5,
		translated: review.translated
	}))

	return testimonials
}
