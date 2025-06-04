'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import type { FAQItemProps } from './types'

export function FAQItem({ faq, isOpen, onToggle }: FAQItemProps) {
	return (
		<button
			onClick={onToggle}
			className="w-full text-left p-6 rounded-xl bg-card/60 backdrop-blur-xs border border-primary/20 hover:border-primary/30 transition-all duration-300 group"
			type="button"
		>
			<div className="flex items-center justify-between gap-4">
				<h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
					{faq.question}
				</h3>
				<div className="flex-shrink-0">
					{isOpen ? (
						<Minus className="h-5 w-5 text-primary" />
					) : (
						<Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
					)}
				</div>
			</div>
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.3, ease: 'easeInOut' }}
						className="overflow-hidden"
					>
						<p className="mt-4 text-muted-foreground leading-relaxed">
							{faq.answer}
						</p>
					</motion.div>
				)}
			</AnimatePresence>
		</button>
	)
}
