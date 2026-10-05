import type React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCSSVariable } from 'uniwind'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

interface IndoorNavHudProps {
	kicker: string
	headline: string
	subline: string
	floorBadge: string
	meta: string
	arrived: boolean
	nextLabel?: string
	nextHint?: string
	nextDir?: 'up' | 'down'
	canGoBack: boolean
	backLabel: string
	endLabel: string
	onBack: () => void
	onNext: () => void
	onCancel: () => void
}

export const IndoorNavHud = ({
	kicker,
	headline,
	subline,
	floorBadge,
	meta,
	arrived,
	nextLabel,
	nextHint,
	nextDir,
	canGoBack,
	backLabel,
	endLabel,
	onBack,
	onNext,
	onCancel
}: IndoorNavHudProps): React.JSX.Element => {
	const insets = useSafeAreaInsets()
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const contrastOnPrimary = getContrastColor(primaryColor)
	const bottom = Platform.OS === 'web' ? 12 : insets.bottom + 12
	const showPrimaryAction = !arrived && nextLabel != null
	const showSubline =
		!showPrimaryAction && subline !== '' && subline !== headline

	return (
		<View
			testID="map-indoor-nav-hud"
			className="absolute left-4 right-4 z-30 rounded-2xl bg-card p-4"
			style={{
				bottom,
				boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)'
			}}
		>
			<Text className="text-[13px] font-semibold text-label" numberOfLines={1}>
				{kicker}
			</Text>
			{!showPrimaryAction && (
				<View className="mt-0.5 flex-row items-baseline gap-2">
					<Text
						className="flex-1 text-xl font-bold text-text"
						numberOfLines={2}
					>
						{headline}
					</Text>
					{!arrived && floorBadge !== '' && (
						<Text className="shrink-0 text-[15px] font-semibold text-primary">
							{floorBadge}
						</Text>
					)}
				</View>
			)}
			{showPrimaryAction && floorBadge !== '' && (
				<Text className="mt-0.5 text-[15px] font-semibold text-primary">
					{floorBadge}
				</Text>
			)}
			{showSubline && (
				<Text
					className="mt-1 text-[15px] leading-5 text-text"
					numberOfLines={2}
				>
					{subline}
				</Text>
			)}
			{meta !== '' && (
				<Text className="mt-1 text-sm leading-5 text-label" numberOfLines={2}>
					{meta}
				</Text>
			)}
			{showPrimaryAction && (
				<Pressable
					testID="map-indoor-nav-next"
					onPress={onNext}
					accessibilityRole="button"
					className="mt-3 flex-row items-center rounded-xl px-4 py-3"
					style={{ backgroundColor: primaryColor }}
				>
					{nextDir != null && (
						<Text
							className="mr-2 text-lg font-bold"
							style={{ color: contrastOnPrimary }}
						>
							{nextDir === 'down' ? '↓' : '↑'}
						</Text>
					)}
					<View className="flex-1">
						<Text
							className="text-lg font-bold leading-6"
							style={{ color: contrastOnPrimary }}
							numberOfLines={2}
						>
							{nextLabel}
						</Text>
						{nextHint != null && nextHint !== '' && (
							<Text
								className="mt-0.5 text-sm leading-5"
								style={{ color: contrastOnPrimary, opacity: 0.92 }}
								numberOfLines={2}
							>
								{nextHint}
							</Text>
						)}
					</View>
				</Pressable>
			)}
			<View className="mt-2 flex-row gap-2">
				<Pressable
					testID="map-indoor-nav-back"
					onPress={onBack}
					disabled={!canGoBack}
					accessibilityRole="button"
					className="flex-1 items-center rounded-xl bg-card-button px-4 py-2.5"
					style={{ opacity: canGoBack ? 1 : 0.4 }}
				>
					<Text className="text-[15px] font-semibold text-text">
						{backLabel}
					</Text>
				</Pressable>
				<Pressable
					testID="map-indoor-nav-end"
					onPress={onCancel}
					accessibilityRole="button"
					className="flex-1 items-center rounded-xl bg-card-button px-4 py-2.5"
				>
					<Text className="text-[15px] font-semibold text-notification">
						{endLabel}
					</Text>
				</Pressable>
			</View>
		</View>
	)
}
