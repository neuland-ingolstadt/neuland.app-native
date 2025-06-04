'use client'

import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslations'
import { SectionHeader } from '../section-header'
import { DownloadCard } from './download-card'
import { useDownloadOptions } from './download-data'

export function DownloadSection() {
	const { t } = useTranslation()
	const downloadOptions = useDownloadOptions()

	return (
		<section className="py-20 sm:py-32 relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-blue-100/50 to-indigo-100/50 dark:from-gray-900/90 dark:via-blue-900/80 dark:to-indigo-900/90" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.1),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.2),transparent_70%)]" />

			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `
					linear-gradient(to right, rgb(0 0 0 / 0.02) 1px, transparent 1px),
					linear-gradient(to bottom, rgb(0 0 0 / 0.02) 1px, transparent 1px)
				`,
					backgroundSize: '4rem 4rem'
				}}
			/>

			<div
				className="absolute inset-0 dark:block hidden"
				style={{
					backgroundImage: `
					linear-gradient(to right, rgb(255 255 255 / 0.02) 1px, transparent 1px),
					linear-gradient(to bottom, rgb(255 255 255 / 0.02) 1px, transparent 1px)
				`,
					backgroundSize: '4rem 4rem'
				}}
			/>

			<div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
				<div className="relative">
					<SectionHeader
						icon={Download}
						title={t('download.title')}
						description={t('download.description')}
					/>

					<div className="mt-16 max-w-4xl mx-auto">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
							{downloadOptions.map((option) => (
								<motion.div
									key={option.title}
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{
										delay: 0.1 * downloadOptions.indexOf(option),
										duration: 0.4
									}}
								>
									<DownloadCard option={option} />
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
