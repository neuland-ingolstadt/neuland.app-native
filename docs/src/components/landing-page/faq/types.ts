export interface FAQ {
	question: string
	answer: string
}

export interface FAQItemProps {
	faq: FAQ
	isOpen: boolean
	onToggle: () => void
}
