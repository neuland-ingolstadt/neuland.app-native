import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable, useUniwind } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import type { ThemeColor } from '@/hooks/usePreferencesStore'
import { themeColorMap } from '@/styles/theme-colors'
import { FEEDBACK_REWARD_ACCENT } from '@/utils/feedback-utils'
import { toColor } from '@/utils/uniwind-utils'

export type AccentChoice = 'keep' | 'reward'

interface AccentCardProps {
	color: ThemeColor
	title: string
	badge?: string
	selected: boolean
	onPress: () => void
	testID: string
}

const AccentCard = ({
	color,
	title,
	badge,
	selected,
	onPress,
	testID
}: AccentCardProps): React.JSX.Element => {
	const { theme } = useUniwind()
	const swatch =
		theme === 'dark' ? themeColorMap[color].dark : themeColorMap[color].light

	return (
		<Pressable
			testID={testID}
			accessibilityRole="button"
			accessibilityState={{ selected }}
			accessibilityLabel={badge != null ? `${title}, ${badge}` : title}
			onPress={() => {
				if (Platform.OS === 'ios') void selectionAsync()
				onPress()
			}}
			className="flex-1 active:opacity-90"
		>
			<View
				className={`rounded-2xl border-2 overflow-hidden bg-card ${
					selected ? 'border-text' : 'border-border'
				}`}
			>
				<View className="px-3 pt-3 pb-2 gap-2 bg-background">
					<View className="flex-row items-center justify-between">
						<View
							className="w-10 h-10 rounded-full"
							style={{ backgroundColor: swatch }}
						/>
						{badge != null && (
							<View
								className="rounded-full px-2 py-0.5"
								style={{ backgroundColor: swatch }}
							>
								<Text className="text-white text-[11px] font-semibold">
									{badge}
								</Text>
							</View>
						)}
					</View>
					<View className="rounded-xl overflow-hidden border-hairline border-border bg-card">
						<View className="px-2.5 pt-2.5 pb-2 gap-1.5">
							<View
								className="h-1.5 rounded-full w-10"
								style={{ backgroundColor: swatch, opacity: 0.9 }}
							/>
							<View
								className="h-1 rounded-full w-16"
								style={{ backgroundColor: swatch, opacity: 0.25 }}
							/>
							<View
								className="mt-1 h-8 rounded-lg items-center justify-center"
								style={{ backgroundColor: swatch }}
							>
								<View className="h-1.5 w-8 rounded-full bg-white opacity-80" />
							</View>
						</View>
					</View>
				</View>
				<View className="px-3 py-3 border-t-hairline border-border">
					<Text className="text-text text-[15px] font-semibold text-center">
						{title}
					</Text>
				</View>
			</View>
		</Pressable>
	)
}

interface AccentChoiceStepProps {
	previousColor: ThemeColor
	choice: AccentChoice
	onChoiceChange: (choice: AccentChoice) => void
}

export default function AccentChoiceStep({
	previousColor,
	choice,
	onChoiceChange
}: AccentChoiceStepProps): React.JSX.Element {
	const { t } = useTranslation('settings')
	const { theme } = useUniwind()
	const rewardAccent =
		themeColorMap[FEEDBACK_REWARD_ACCENT][theme === 'dark' ? 'dark' : 'light']
	const iconBg = toColor(useCSSVariable('--color-primary-background'))

	const colorLabel = (color: ThemeColor): string =>
		t(`theme.accent.${color}` as const)

	return (
		<View testID="feedback-accent-step" className="gap-6">
			<View className="items-center gap-3">
				<View
					className="w-14 h-14 rounded-full items-center justify-center"
					style={{ backgroundColor: iconBg }}
				>
					<PlatformIcon
						ios={{ name: 'paintpalette.fill', size: 24 }}
						android={{ name: 'palette', size: 28 }}
						web={{ name: 'Palette', size: 26 }}
						style={{ color: rewardAccent }}
					/>
				</View>
				<View className="gap-2 px-1">
					<Text className="text-text text-[26px] font-bold text-center leading-8">
						{t('feedback.accentUnlock.title')}
					</Text>
					<Text className="text-label text-[15px] text-center leading-5">
						{t('feedback.accentUnlock.subtitle')}
					</Text>
				</View>
			</View>

			<View className="flex-row gap-3">
				<AccentCard
					testID="feedback-accent-keep"
					color={previousColor}
					title={t('feedback.accentUnlock.keep', {
						color: colorLabel(previousColor)
					})}
					selected={choice === 'keep'}
					onPress={() => {
						onChoiceChange('keep')
					}}
				/>
				<AccentCard
					testID="feedback-accent-reward"
					color={FEEDBACK_REWARD_ACCENT}
					title={t('feedback.accentUnlock.new', {
						color: colorLabel(FEEDBACK_REWARD_ACCENT)
					})}
					badge={t('feedback.accentUnlock.exclusive')}
					selected={choice === 'reward'}
					onPress={() => {
						onChoiceChange('reward')
					}}
				/>
			</View>
		</View>
	)
}
