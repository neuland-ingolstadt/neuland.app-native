import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
	icon: LucideIcon
	title: string
	description?: string
	iconColor?: string
	titleColor?: string
}

export function SectionHeader({
	icon: Icon,
	title,
	description,
	iconColor = 'text-primary',
	titleColor = 'from-primary to-primary/60'
}: SectionHeaderProps) {
	return (
		<div className="relative pt-12 pb-8">
			<motion.div
				initial={{ opacity: 0, scale: 0.5 }}
				whileInView={{ opacity: 1, scale: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.2, type: 'spring' }}
				className="absolute top-0 left-1/2 -translate-x-1/2"
			>
				<Icon className={`h-10 w-10 ${iconColor}`} />
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="mx-auto max-w-2xl text-center"
			>
				<h2
					className={`text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6 bg-clip-text text-transparent bg-gradient-to-r ${titleColor} leading-tight`}
				>
					{title}
				</h2>
				{description && (
					<p className="text-lg text-muted-foreground">{description}</p>
				)}
			</motion.div>
		</div>
	)
}
