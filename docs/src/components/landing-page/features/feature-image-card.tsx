'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'
import { useFeatures } from './feature-data'
import type { FeatureImageCardProps } from './types'

export function FeatureImageCard({
	icon: Icon,
	title,
	description,
	buttonLabel,
	image,
	imageDark,
	imageAlt,
	type
}: FeatureImageCardProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [showEasterEgg, setShowEasterEgg] = useState(false)
	const { easterEggMessages, featureDetails } = useFeatures()

	const handleImageClick = () => {
		setShowEasterEgg(true)
		setTimeout(() => setShowEasterEgg(false), 2000)
	}

	const details = featureDetails[type]

	return (
		<>
			<Card className="group relative overflow-hidden bg-card/50 backdrop-blur-xs border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 h-full">
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
					initial={{ opacity: 0 }}
					whileHover={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				/>
				<div className="relative p-6 sm:p-8 h-full">
					<div className="grid lg:grid-cols-2 gap-8 items-center h-full">
						<div className="flex flex-col h-full">
							<motion.div
								className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-blue-500/30 transition-colors relative"
								whileHover={{ scale: 1.03 }}
								transition={{ type: 'spring', stiffness: 300, damping: 15 }}
							>
								<Icon className="h-6 w-6 text-primary" />
								<motion.div
									className="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity"
									initial={{ opacity: 0 }}
									whileHover={{ opacity: 1 }}
									transition={{ duration: 0.3 }}
								/>
							</motion.div>
							<motion.h3
								className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors"
								initial={{ opacity: 0, y: 5 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.3 }}
							>
								{title}
							</motion.h3>
							<motion.p
								className="text-base text-muted-foreground/90 group-hover:text-muted-foreground/80 transition-colors mb-6 flex-grow"
								initial={{ opacity: 0, y: 5 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.3, delay: 0.1 }}
							>
								{description}
							</motion.p>
							<Button
								size="sm"
								className="group mt-auto w-fit px-4"
								onClick={() => setIsDialogOpen(true)}
							>
								{buttonLabel}
								<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Button>
						</div>
						<div className="relative h-full flex items-center">
							<div className="relative w-full">
								<motion.div
									whileHover={{ scale: 1.01 }}
									whileTap={{ scale: 0.99 }}
									transition={{ type: 'spring', stiffness: 300, damping: 20 }}
									className="relative cursor-pointer"
									onClick={handleImageClick}
								>
									<Image
										src={image}
										alt={imageAlt}
										width={600}
										height={300}
										className="w-full h-[300px] object-contain object-center rounded-lg dark:hidden"
									/>
									<Image
										src={imageDark}
										alt={imageAlt}
										width={600}
										height={300}
										className="w-full h-[300px] object-contain object-center rounded-lg hidden dark:block"
									/>
									<AnimatePresence>
										{showEasterEgg && (
											<motion.div
												initial={{ opacity: 0, y: 5 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -5 }}
												transition={{ duration: 0.2 }}
												className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-accent-foreground/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-accent-foreground/10 text-sm font-medium text-center "
											>
												{easterEggMessages[type]}
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</Card>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle className="text-2xl font-bold flex items-center gap-2">
							<Icon className="h-6 w-6 text-primary" />
							{title}
						</DialogTitle>
						<DialogDescription className="text-base">
							{description}
						</DialogDescription>
					</DialogHeader>

					<div className="mt-6 space-y-4">
						<h4 className="font-semibold text-lg">{details.title}</h4>
						<ul className="list-disc list-inside space-y-2 text-muted-foreground">
							{details.items.map((item: string) => (
								<li key={`${type}-${item}`}>{item}</li>
							))}
						</ul>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
