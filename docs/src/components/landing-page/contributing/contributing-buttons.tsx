'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { ContributingButton } from './types'

interface ContributingButtonsProps {
	buttons: ContributingButton[]
}

export function ContributingButtons({ buttons }: ContributingButtonsProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, delay: 0.4 }}
			className="flex flex-col sm:flex-row gap-4 justify-center"
		>
			{buttons.map((button) => (
				<Button
					key={button.label}
					asChild
					size="lg"
					variant={button.variant}
					className={
						button.variant === 'default'
							? 'shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
							: 'hover:bg-primary/10 transition-all duration-300 hover:scale-105'
					}
				>
					<a
						href={button.href}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2"
					>
						<button.icon className="h-5 w-5" />
						{button.label}
					</a>
				</Button>
			))}
		</motion.div>
	)
}
