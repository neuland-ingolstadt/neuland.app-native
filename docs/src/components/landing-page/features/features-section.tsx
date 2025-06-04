'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/useTranslations'
import { SectionHeader } from '../section-header'
import { useFeatures } from './feature-data'
import { FeatureImageCard } from './feature-image-card'

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.08,
			delayChildren: 0.1
		}
	}
}

const itemVariants = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			ease: 'easeOut'
		}
	},
	exit: {
		opacity: 0,
		y: -10,
		transition: {
			duration: 0.2,
			ease: 'easeIn'
		}
	}
}

export function FeaturesSection() {
	const { t } = useTranslation()
	const { features } = useFeatures()

	return (
		<section className="py-12 sm:py-20 relative overflow-hidden bg-muted/30">
			{/* Decorative background elements */}
			<div className="absolute inset-0 pointer-events-none">
				<motion.div
					className="absolute top-20 left-[10%] w-48 h-48 bg-primary/5 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.1, 1],
						opacity: [0.3, 0.4, 0.3]
					}}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: 'easeInOut'
					}}
				/>
				<motion.div
					className="absolute bottom-20 right-[10%] w-48 h-48 bg-primary/5 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.1, 1],
						opacity: [0.3, 0.4, 0.3]
					}}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 1
					}}
				/>
			</div>

			<div className="mx-auto max-w-7xl px-4 lg:px-8 relative">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.4 }}
				>
					<SectionHeader
						icon={Sparkles}
						title={t('features.title')}
						description={t('features.description')}
					/>
				</motion.div>

				{/* Feature Grid - Two rows with two cards each */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-6 sm:mt-12 lg:mx-0 lg:max-w-none lg:grid-cols-2"
				>
					<AnimatePresence mode="popLayout">
						{features.map((feature) => (
							<motion.div
								key={feature.title}
								variants={itemVariants}
								layout
								whileHover={{ scale: 1.01 }}
								transition={{ type: 'spring', stiffness: 300, damping: 20 }}
							>
								<FeatureImageCard
									{...feature}
									buttonLabel={t('features.learnMore')}
								/>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.4 }}
					className="mt-12 text-center"
				>
					<Button variant="outline" size="lg" className="group" asChild>
						<a href="/docs/app/faq" className="inline-flex items-center gap-2">
							{t('features.discoverAll')}
							<ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
						</a>
					</Button>
				</motion.div>
			</div>
		</section>
	)
}
