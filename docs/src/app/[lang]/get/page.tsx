'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Download } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { DownloadCard } from '@/components/landing-page/download/download-card'
import { useDownloadOptions } from '@/components/landing-page/download/download-data'
import { SectionHeader } from '@/components/landing-page/section-header'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/useTranslations'

declare global {
	interface Window {
		MSStream?: MSStream
		opera?: Opera
	}
}

interface MSStream {
	readonly type: string
	readonly size: number
	readonly lastModifiedDate: Date
	slice(start?: number, end?: number): MSStream
}

interface Opera {
	version(): string
	addEventListener(type: string, listener: EventListener): void
	removeEventListener(type: string, listener: EventListener): void
}

export default function DownloadPage() {
	const { t } = useTranslation()
	const router = useRouter()
	const downloadOptions = useDownloadOptions()

	useEffect(() => {
		const redirectBasedOnOS = () => {
			const userAgent = (
				navigator.userAgent ||
				navigator.vendor ||
				window.opera ||
				''
			).toString()

			if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
				window.location.href =
					'https://apps.apple.com/app/apple-store/id1617096811?pt=124486931&ct=web&mt=8'
			} else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
				window.location.href =
					'https://apps.apple.com/app/apple-store/id1617096811?pt=124486931&ct=web&mt=8'
			} else if (/android/i.test(userAgent)) {
				window.location.href =
					'https://play.google.com/store/apps/details?id=app.neuland'
			}
		}

		redirectBasedOnOS()
	}, [])

	return (
		<div className="min-h-screen ">
			<div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
				<SectionHeader
					icon={Download}
					title={t('download.title')}
					description={t('download.description')}
				/>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mt-16 max-w-4xl mx-auto"
					id="links"
					style={{ display: 'block' }}
				>
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
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="mt-16 text-center text-sm text-muted-foreground"
				>
					<p>{t('download.description')}</p>
				</motion.div>

				{/* Action Buttons */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 1, duration: 0.4 }}
					className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
				>
					<Button
						variant="outline"
						size="lg"
						className="group px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-blue-500/25 transition-all duration-300"
						onClick={() => router.push('/')}
					>
						Discover Neuland Next
						<ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
					</Button>
				</motion.div>

				{/* App Preview Section */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6, duration: 0.4 }}
					className="mt-32 relative"
				>
					<div className="relative mx-auto max-w-[1200px]">
						{/* Main center phone */}
						<motion.div
							whileHover={{ scale: 1.02 }}
							transition={{ type: 'spring', stiffness: 300, damping: 20 }}
							className="relative mx-auto max-w-[240px] sm:max-w-[280px] md:max-w-[320px] lg:max-w-md z-10"
						>
							<Image
								src="/assets/dashboard_header.webp"
								alt="Neuland Next Dashboard"
								width={800}
								height={1600}
								className="w-full rounded-4xl object-cover"
							/>
						</motion.div>

						{/* Left side phone - Calendar */}
						<motion.div
							initial={{ x: -50, rotate: -12 }}
							animate={{ x: 0, rotate: -12 }}
							transition={{ delay: 0.4, duration: 0.3 }}
							whileHover={{ rotate: -8 }}
							className="absolute left-[5%] top-8 max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-xs z-0"
						>
							<Image
								src="/assets/calendar_header.webp"
								alt="Calendar View"
								width={600}
								height={1200}
								className="w-full rounded-4xl object-cover"
							/>
						</motion.div>

						{/* Right side phone - Campus Map */}
						<motion.div
							initial={{ x: 50, rotate: 12 }}
							animate={{ x: 0, rotate: 12 }}
							transition={{ delay: 0.4, duration: 0.3 }}
							whileHover={{ rotate: 8 }}
							className="absolute right-[5%] top-8 max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-xs z-0"
						>
							<Image
								src="/assets/map_header.webp"
								alt="Campus Map"
								width={600}
								height={1200}
								className="w-full rounded-4xl object-cover"
							/>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</div>
	)
}
