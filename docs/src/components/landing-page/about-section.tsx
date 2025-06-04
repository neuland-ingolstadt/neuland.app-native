'use client'
import { motion } from 'framer-motion'
import { Code, Coffee, Heart, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import NeulandLabel from '@/components/icons/neuland'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/useTranslations'

export function AboutSection() {
	const { t } = useTranslation()

	return (
		<section className="py-20 sm:py-32 bg-muted/10 relative overflow-hidden">
			<div className="absolute inset-0 pointer-events-none">
				<motion.div
					className="absolute top-1/4 right-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3]
					}}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: 'easeInOut'
					}}
				/>
				<motion.div
					className="absolute bottom-1/4 left-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3]
					}}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: 'easeInOut',
						delay: 1
					}}
				/>
			</div>

			<div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
				<div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
					<div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-center">
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, ease: 'easeOut' }}
						>
							<div className="relative pt-12 pb-8">
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.2, duration: 0.6 }}
									className="absolute top-0 left-0"
								>
									<Badge variant="secondary" className="group">
										<Heart className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
										{t('about.badge')}
									</Badge>
								</motion.div>
							</div>

							<motion.h2
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.4, duration: 0.6 }}
								className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
							>
								{t('about.title')}
							</motion.h2>

							<motion.p
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.6, duration: 0.6 }}
								className="mt-6 text-lg text-muted-foreground"
							>
								{t('about.description.part1')}
							</motion.p>

							<motion.p
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.8, duration: 0.6 }}
								className="mt-4 text-lg text-muted-foreground"
							>
								{t('about.description.part2')}
							</motion.p>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 1, duration: 0.6 }}
								className="mt-8 flex flex-wrap items-center gap-4"
							>
								<motion.div
									whileHover={{ scale: 1.05 }}
									className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-primary/20 shadow-xs backdrop-blur-xs transition-all duration-200 hover:bg-primary/20 hover:border-primary/40 group"
								>
									<Code className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
									<span className="text-sm font-semibold text-foreground">
										{t('about.tags.openSource')}
									</span>
								</motion.div>
								<motion.div
									whileHover={{ scale: 1.05 }}
									className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-primary/20 shadow-xs backdrop-blur-xs transition-all duration-200 hover:bg-primary/20 hover:border-primary/40  group"
								>
									<Coffee className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
									<span className="text-sm font-semibold text-foreground">
										{t('about.tags.community')}
									</span>
								</motion.div>
								<motion.div
									whileHover={{ scale: 1.05 }}
									className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-primary/20 shadow-xs backdrop-blur-xs transition-all duration-200 hover:bg-primary/20 hover:border-primary/40 group"
								>
									<Users className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
									<span className="text-sm font-semibold text-foreground">
										{t('about.tags.members')}
									</span>
								</motion.div>
							</motion.div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, ease: 'easeOut' }}
							className="relative"
						>
							<motion.div
								whileHover={{ scale: 1.02 }}
								transition={{ type: 'spring', stiffness: 300, damping: 20 }}
								className="aspect-square overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 relative"
							>
								<div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent z-10" />

								<Image
									src="/assets/neuland_workshop.webp"
									alt="Team working together"
									width={800}
									height={800}
									className="h-full w-full object-cover"
									priority
								/>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.6, duration: 0.6 }}
								whileHover={{ scale: 1.05 }}
								className="absolute -bottom-6 -right-6 rounded-xl bg-card p-6 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-xs"
							>
								<div className="text-center">
									<motion.div
										initial={{ opacity: 0, scale: 0.5 }}
										whileInView={{ opacity: 1, scale: 1 }}
										viewport={{ once: true }}
										transition={{
											delay: 0.8,
											type: 'spring',
											stiffness: 200,
											damping: 20
										}}
										className="text-2xl font-bold text-foreground"
									>
										2021
									</motion.div>
									<div className="text-sm text-muted-foreground">
										{t('about.stats.started')}
									</div>
								</div>
							</motion.div>

							<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transform translate-x-16 -translate-y-16" />
						</motion.div>
					</div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 0 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.5, duration: 0.6 }}
					className="mt-16 flex flex-col  gap-8"
				>
					<Badge variant="secondary" className="group">
						<Code className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
						{t('about.poweredBy')}
					</Badge>
					<Link
						className="inline-block w-64 text-foreground"
						href="https://neuland-ingolstadt.de"
						target="_blank"
					>
						<NeulandLabel color="currentColor" className="w-full h-auto" />
					</Link>
				</motion.div>
			</div>
		</section>
	)
}
