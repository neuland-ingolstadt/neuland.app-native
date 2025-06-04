'use client'

import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { TestimonialCardProps } from './types'

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
	const { content, author, role, rating, delay = 0, translated } = testimonial

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, delay }}
			className="group relative"
		>
			<div className="relative p-8 rounded-2xl border border-primary/10 bg-card/50 backdrop-blur-xs hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
				{/* Gradient background */}
				<div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

				{/* Quote icon */}
				<div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
					<Quote className="w-4 h-4 text-primary/60" />
				</div>

				{/* Content */}
				<div className="relative space-y-6">
					{/* Rating */}
					<div className="flex items-center gap-1">
						{Array.from({ length: rating }).map((_, i) => (
							<motion.div
								key={`${author}-star-${i}`}
								initial={{ opacity: 0, scale: 0 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.3 + i * 0.1 }}
								whileHover={{ scale: 1.2 }}
							>
								<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
							</motion.div>
						))}
					</div>

					{/* Testimonial text */}
					<blockquote className="text-lg text-muted-foreground/90 group-hover:text-muted-foreground/80 transition-colors">
						"{content}"
					</blockquote>

					{/* Author info */}
					<div className="flex items-center gap-3 pt-4 border-t border-primary/10">
						<Avatar className="ring-2 ring-yellow-500/20 group-hover:ring-yellow-500/40 transition-all">
							<AvatarFallback>
								{author
									.split(' ')
									.map((n) => n[0])
									.join('')}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<div className="font-semibold text-foreground group-hover:text-primary transition-colors">
									{author}
								</div>
								{translated && (
									<Badge
										variant="secondary"
										className="text-xs text-primary/90"
									>
										translated
									</Badge>
								)}
							</div>
							<div className="text-sm text-muted-foreground/90 group-hover:text-muted-foreground/80 transition-colors">
								{role}
							</div>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}
