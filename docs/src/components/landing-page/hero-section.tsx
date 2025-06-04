'use client'
import { motion } from 'framer-motion'
import {
	Calendar,
	Clock,
	Download,
	Github,
	Globe,
	Lock,
	MapPin,
	Newspaper,
	Utensils,
	Volleyball
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/useTranslations'
import NeulandLogo from '../icons/logo'

export function HeroSection() {
	const [platform, setPlatform] = useState<'mac' | 'ios' | 'android' | 'other'>(
		'other'
	)
	const { t } = useTranslation()

	useEffect(() => {
		const userAgent = navigator.userAgent.toLowerCase()
		const platform = navigator.platform.toLowerCase()

		if (platform.includes('mac')) {
			setPlatform('mac')
		} else if (/iphone|ipad|ipod/.test(userAgent)) {
			setPlatform('ios')
		} else if (/android/.test(userAgent)) {
			setPlatform('android')
		} else {
			setPlatform('other')
		}
	}, [])

	const getDownloadButtonText = () => {
		switch (platform) {
			case 'mac':
				return t('hero.buttons.download.mac')
			case 'ios':
				return t('hero.buttons.download.ios')
			case 'android':
				return t('hero.buttons.download.android')
			default:
				return t('hero.buttons.download.default')
		}
	}

	return (
		<section className="relative overflow-hidden bg-linear-to-br from-gray-900 via-blue-900 to-indigo-00 py-20 sm:py-32 min-h-screen flex items-center">
			<div className="absolute inset-0 bg-linear-to-br from-gray-900/90 via-blue-900/80 to-indigo-900/90" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.2),transparent_70%)]" />

			<motion.div
				className="absolute top-20 left-[10%] w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"
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
				className="absolute top-40 right-[15%] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl"
				animate={{
					scale: [1, 1.3, 1],
					opacity: [0.3, 0.6, 0.3]
				}}
				transition={{
					duration: 5,
					repeat: Infinity,
					ease: 'easeInOut',
					delay: 1
				}}
			/>
			<motion.div
				className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.3, 0.5, 0.3]
				}}
				transition={{
					duration: 4.5,
					repeat: Infinity,
					ease: 'easeInOut',
					delay: 0.5
				}}
			/>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.6, duration: 0.6 }}
				className="absolute bottom-12 left-[5%] hidden lg:block"
			>
				<div className="space-y-2 text-right">
					<p className="text-sm text-gray-400 font-mono">
						{t('hero.decorative.currentLecture')}
					</p>
					<p className="text-lg text-gray-300 font-mono">
						Software Engineering
					</p>
					<p className="text-sm text-gray-400 font-mono">
						{t('hero.decorative.nextLecture')}
					</p>
					<p className="text-lg text-gray-300 font-mono">Datenbanken</p>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.8, duration: 0.6 }}
				className="absolute bottom-12 right-[5%] hidden lg:block"
			>
				<div className="space-y-2">
					<p className="text-sm text-gray-400 font-mono">
						{t('hero.decorative.mensaMenu')}
					</p>
					<p className="text-lg text-gray-300 font-mono">Pasta Bolognese</p>
					<p className="text-sm text-gray-400 font-mono">
						{t('hero.decorative.availableRooms')}
					</p>
					<p className="text-lg text-gray-300 font-mono">
						Raum G213, Raum J101
					</p>
				</div>
			</motion.div>

			<div className="relative mx-auto max-w-[1400px] px-6 lg:px-12 xl:px-16 w-full">
				<div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, ease: 'easeOut' }}
						className="text-left max-w-2xl"
					>
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4, duration: 0.6 }}
							className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2 "
						>
							<span className="bg-linear-to-r from-blue-100 to-indigo-100 bg-clip-text text-transparent">
								{t('hero.title')}
							</span>
						</motion.h1>

						<motion.h2
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6, duration: 0.6 }}
							className="text-xl sm:text-2xl md:text-3xl leading-relaxed text-gray-200 mb-4 font-medium"
						>
							{t('hero.subtitle')}
						</motion.h2>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.8, duration: 0.6 }}
							className="text-base sm:text-lg text-gray-400 mb-8 font-light"
						>
							{t('hero.by')}
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1, duration: 0.6 }}
							className="flex flex-wrap gap-4 mb-12 text-sm"
						>
							{[
								{ icon: Calendar, text: t('hero.features.schedule') },
								{ icon: MapPin, text: t('hero.features.campusMap') },
								{ icon: Utensils, text: t('hero.features.mensa') },
								{ icon: Clock, text: t('hero.features.events') }
							].map((item, index) => (
								<motion.div
									key={item.text}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
									whileHover={{ scale: 1.05 }}
									className="flex items-center gap-2 px-4 py-2.5 bg-white/5 backdrop-blur-xs rounded-full border border-white/10"
								>
									<item.icon className="h-4 w-4 text-gray-400" />
									<span className="text-gray-300">{item.text}</span>
								</motion.div>
							))}
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1.4, duration: 0.6 }}
							className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
						>
							<div className="flex flex-col sm:flex-row gap-4">
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Button
										size="lg"
										className="px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white border-0"
										onClick={() => {
											window.open('https://next.neuland.app/get', '_blank')
										}}
									>
										<Download className="mr-2 h-5 w-5" />
										{getDownloadButtonText()}
									</Button>
								</motion.div>
								<motion.div
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Button
										size="lg"
										className="px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 bg-white/10 hover:bg-white/20 text-white border border-white/20"
										onClick={() => {
											window.open(
												'https://web.neuland.app',
												'_blank',
												'noopener,noreferrer'
											)
										}}
									>
										<Globe className="mr-2 h-5 w-5" />
										{t('hero.buttons.webVersion')}
									</Button>
								</motion.div>
							</div>
						</motion.div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.6, duration: 0.8 }}
						className="flex justify-center lg:justify-end relative hidden lg:flex"
					>
						<motion.div
							className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl scale-150"
							animate={{
								scale: [1.5, 1.6, 1.5],
								opacity: [0.2, 0.3, 0.2]
							}}
							transition={{
								duration: 6,
								repeat: Infinity,
								ease: 'easeInOut'
							}}
						/>

						<div className="relative w-[500px] h-[500px] flex items-center justify-center">
							<motion.div
								animate={{
									scale: [1, 1.01, 1],
									rotate: [0, 360]
								}}
								transition={{
									scale: {
										duration: 8,
										repeat: Infinity,
										ease: 'easeInOut'
									},
									rotate: {
										duration: 120,
										repeat: Infinity,
										ease: 'linear'
									}
								}}
								className="absolute w-[400px] h-[400px] rounded-full border border-white/[0.03] bg-linear-to-br from-blue-500/[0.02] to-indigo-500/[0.02]"
							/>

							<motion.div
								animate={{
									scale: [1, 1.005, 1],
									rotate: [0, -360]
								}}
								transition={{
									scale: {
										duration: 7,
										repeat: Infinity,
										ease: 'easeInOut'
									},
									rotate: {
										duration: 100,
										repeat: Infinity,
										ease: 'linear'
									}
								}}
								className="absolute w-[320px] h-[320px] rounded-full border border-white/[0.02] bg-linear-to-br from-blue-500/[0.01] to-indigo-500/[0.01]"
							/>

							<div className="absolute w-full h-full">
								<motion.div
									className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
									animate={{
										y: [0, -6, 0],
										opacity: [0.6, 0.8, 0.6]
									}}
									transition={{
										duration: 12,
										repeat: Infinity,
										ease: 'easeInOut'
									}}
								>
									<div className="flex flex-col items-center gap-3">
										<div className="w-12 h-12 rounded-xl bg-blue-500/10 backdrop-blur-xs border border-white/5 flex items-center justify-center">
											<Calendar className="w-6 h-6 text-white/70" />
										</div>
										<motion.span
											className="text-sm text-white/70 font-medium"
											animate={{
												opacity: [0, 0.7, 0],
												y: [0, -2, 0]
											}}
											transition={{
												duration: 12,
												repeat: Infinity,
												ease: 'easeInOut'
											}}
										>
											{t('hero.features.schedule')}
										</motion.span>
									</div>
								</motion.div>

								<motion.div
									className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
									animate={{
										y: [0, 6, 0],
										opacity: [0.6, 0.8, 0.6]
									}}
									transition={{
										duration: 12,
										repeat: Infinity,
										ease: 'easeInOut',
										delay: 1.5
									}}
								>
									<div className="flex flex-col items-center gap-3">
										<div className="w-12 h-12 rounded-xl bg-blue-500/10 backdrop-blur-xs border border-white/5 flex items-center justify-center">
											<MapPin className="w-6 h-6 text-white/70" />
										</div>
										<motion.span
											className="text-sm text-white/70 font-medium"
											animate={{
												opacity: [0, 0.7, 0],
												y: [0, 2, 0]
											}}
											transition={{
												duration: 12,
												repeat: Infinity,
												ease: 'easeInOut',
												delay: 1.5
											}}
										>
											{t('hero.features.campusMap')}
										</motion.span>
									</div>
								</motion.div>

								<motion.div
									className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
									animate={{
										x: [0, -6, 0],
										opacity: [0.6, 0.8, 0.6]
									}}
									transition={{
										duration: 12,
										repeat: Infinity,
										ease: 'easeInOut',
										delay: 3
									}}
								>
									<div className="flex flex-col items-center gap-3">
										<div className="w-12 h-12 rounded-xl bg-blue-500/10 backdrop-blur-xs border border-white/5 flex items-center justify-center">
											<Utensils className="w-6 h-6 text-white/70" />
										</div>
										<motion.span
											className="text-sm text-white/70 font-medium"
											animate={{
												opacity: [0, 0.7, 0],
												x: [0, -2, 0]
											}}
											transition={{
												duration: 12,
												repeat: Infinity,
												ease: 'easeInOut',
												delay: 3
											}}
										>
											{t('hero.features.mensa')}
										</motion.span>
									</div>
								</motion.div>

								<motion.div
									className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
									animate={{
										x: [0, 6, 0],
										opacity: [0.6, 0.8, 0.6]
									}}
									transition={{
										duration: 12,
										repeat: Infinity,
										ease: 'easeInOut',
										delay: 4.5
									}}
								>
									<div className="flex flex-col items-center gap-3">
										<div className="w-12 h-12 rounded-xl bg-blue-500/10 backdrop-blur-xs border border-white/5 flex items-center justify-center">
											<Clock className="w-6 h-6 text-white/70" />
										</div>
										<motion.span
											className="text-sm text-white/70 font-medium"
											animate={{
												opacity: [0, 0.7, 0],
												x: [0, 2, 0]
											}}
											transition={{
												duration: 12,
												repeat: Infinity,
												ease: 'easeInOut',
												delay: 4.5
											}}
										>
											{t('hero.features.events')}
										</motion.span>
									</div>
								</motion.div>

								<motion.div
									className="absolute top-1/4 right-1/4"
									animate={{
										scale: [1, 1.03, 1],
										opacity: [0.6, 0.8, 0.6]
									}}
									transition={{
										duration: 12,
										repeat: Infinity,
										ease: 'easeInOut',
										delay: 2.1
									}}
								>
									<div className="flex flex-col items-center gap-3">
										<div className="w-12 h-12 rounded-xl bg-blue-500/10 backdrop-blur-xs border border-white/5 flex items-center justify-center">
											<Lock className="w-6 h-6 text-white/70" />
										</div>
										<motion.span
											className="text-sm text-white/70 font-medium"
											animate={{
												opacity: [0, 0.7, 0],
												scale: [1, 1.03, 1]
											}}
											transition={{
												duration: 12,
												repeat: Infinity,
												ease: 'easeInOut',
												delay: 2.1
											}}
										>
											{t('hero.features.privacy')}
										</motion.span>
									</div>
								</motion.div>

								<motion.div
									className="absolute top-1/4 left-1/4"
									animate={{
										scale: [1, 1.03, 1],
										opacity: [0.6, 0.8, 0.6]
									}}
									transition={{
										duration: 12,
										repeat: Infinity,
										ease: 'easeInOut',
										delay: 3.6
									}}
								>
									<div className="flex flex-col items-center gap-3">
										<div className="w-12 h-12 rounded-xl bg-blue-500/10 backdrop-blur-xs border border-white/5 flex items-center justify-center">
											<Github className="w-6 h-6 text-white/70" />
										</div>
										<motion.span
											className="text-sm text-white/70 font-medium"
											animate={{
												opacity: [0, 0.7, 0],
												scale: [1, 1.03, 1]
											}}
											transition={{
												duration: 12,
												repeat: Infinity,
												ease: 'easeInOut',
												delay: 3.6
											}}
										>
											{t('hero.features.openSource')}
										</motion.span>
									</div>
								</motion.div>

								<motion.div
									className="absolute bottom-1/4 right-1/4"
									animate={{
										scale: [1, 1.03, 1],
										opacity: [0.6, 0.8, 0.6]
									}}
									transition={{
										duration: 12,
										repeat: Infinity,
										ease: 'easeInOut',
										delay: 5.1
									}}
								>
									<div className="flex flex-col items-center gap-3">
										<div className="w-12 h-12 rounded-xl bg-blue-500/10 backdrop-blur-xs border border-white/5 flex items-center justify-center">
											<Newspaper className="w-6 h-6 text-white/70" />
										</div>
										<motion.span
											className="text-sm text-white/70 font-medium"
											animate={{
												opacity: [0, 0.7, 0],
												scale: [1, 1.03, 1]
											}}
											transition={{
												duration: 12,
												repeat: Infinity,
												ease: 'easeInOut',
												delay: 5.1
											}}
										>
											{t('hero.features.news')}
										</motion.span>
									</div>
								</motion.div>

								<motion.div
									className="absolute bottom-1/4 left-1/4"
									animate={{
										scale: [1, 1.03, 1],
										opacity: [0.6, 0.8, 0.6]
									}}
									transition={{
										duration: 12,
										repeat: Infinity,
										ease: 'easeInOut',
										delay: 6.6
									}}
								>
									<div className="flex flex-col items-center gap-3">
										<div className="w-12 h-12 rounded-xl bg-blue-500/10 backdrop-blur-xs border border-white/5 flex items-center justify-center">
											<Volleyball className="w-6 h-6 text-white/70" />
										</div>
										<motion.span
											className="text-sm text-white/70 font-medium"
											animate={{
												opacity: [0, 0.7, 0],
												scale: [1, 1.03, 1]
											}}
											transition={{
												duration: 12,
												repeat: Infinity,
												ease: 'easeInOut',
												delay: 6.6
											}}
										>
											{t('hero.features.campusSport')}
										</motion.span>
									</div>
								</motion.div>
							</div>

							<motion.div
								animate={{
									scale: [1, 1.01, 1],
									rotate: [0, 0.5, 0, -0.5, 0]
								}}
								transition={{
									duration: 8,
									repeat: Infinity,
									ease: 'easeInOut'
								}}
								className="relative w-32 h-32 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/5 shadow-xl flex items-center justify-center"
							>
								<NeulandLogo
									className="w-20 h-20 object-contain"
									color="white"
								/>
							</motion.div>
						</div>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.4 }}
					className="mt-20 sm:mt-32 md:mt-40 flow-root"
				>
					<div className="relative mx-auto max-w-[1200px]">
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

						<motion.div
							initial={{ opacity: 0, x: -50, rotate: -12 }}
							animate={{ opacity: 0.8, x: 0, rotate: -12 }}
							transition={{ delay: 0.2, duration: 0.3 }}
							whileHover={{ opacity: 1, rotate: -8 }}
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

						<motion.div
							initial={{ opacity: 0, x: 50, rotate: 12 }}
							animate={{ opacity: 0.8, x: 0, rotate: 12 }}
							transition={{ delay: 0.2, duration: 0.3 }}
							whileHover={{ opacity: 1, rotate: 8 }}
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
		</section>
	)
}
