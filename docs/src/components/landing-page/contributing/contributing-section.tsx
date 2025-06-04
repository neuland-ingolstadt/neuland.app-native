'use client'

import { motion } from 'framer-motion'
import { Github } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslations'
import { SectionHeader } from '../section-header'
import { ContributingButtons } from './contributing-buttons'
import { ContributingCard } from './contributing-card'
import {
	useContributingButtons,
	useContributingCards
} from './contributing-data'

export function ContributingSection() {
	const { t } = useTranslation()
	const contributingButtons = useContributingButtons()
	const contributingCards = useContributingCards()

	return (
		<section className="py-20 sm:py-32 relative overflow-hidden bg-muted/10">
			{/* Animated code background */}
			<div className="absolute inset-0 pointer-events-none opacity-10">
				<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat animate-[gradient_15s_ease_infinite]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
			</div>

			<div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
				<div className="relative">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Left side - Main content */}
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, ease: 'easeOut' }}
							className="relative z-10"
						>
							<SectionHeader
								icon={Github}
								title={t('contributing.title')}
								description={t('contributing.description')}
								iconColor="text-blue-400"
								titleColor="from-blue-500 to-sky-500"
							/>

							<ContributingButtons buttons={contributingButtons} />
						</motion.div>

						{/* Right side - Interactive cards */}
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, ease: 'easeOut' }}
							className="relative"
						>
							<div className="grid grid-cols-2 gap-4">
								{contributingCards.map((card, index) => (
									<motion.div
										key={card.title}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: 0.2 * index, duration: 0.6 }}
									>
										<ContributingCard card={card} />
									</motion.div>
								))}
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	)
}
