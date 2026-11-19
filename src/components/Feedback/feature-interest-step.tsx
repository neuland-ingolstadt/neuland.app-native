import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import type { FeatureIdea, FeatureInterest } from '@/api/feedback-api'
import type { LucideIcon } from '@/components/Universal/icon'
import PlatformIcon from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'
import { FEATURE_INTEREST_LEVELS } from '@/utils/feedback-utils'
import { toColor } from '@/utils/uniwind-utils'

export const FEATURE_ICONS: Record<
	FeatureIdea,
	{ ios: string; android: MaterialIcon; web: LucideIcon }
> = {
	digitalId: { ios: 'person.text.rectangle', android: 'badge', web: 'IdCard' },
	mensaPayment: {
		ios: 'creditcard',
		android: 'credit_card',
		web: 'CreditCard'
	},
	librarySeats: { ios: 'chair.lounge', android: 'chair', web: 'Armchair' },
	roomNavigation: {
		ios: 'signpost.right',
		android: 'directions_walk',
		web: 'Signpost'
	},
	studentExchange: { ios: 'person.2', android: 'group', web: 'Users' },
	campusUpdates: {
		ios: 'newspaper.fill',
		android: 'newspaper',
		web: 'Newspaper'
	},
	eventSignup: {
		ios: 'calendar.badge.plus',
		android: 'event',
		web: 'CalendarPlus'
	},
	mensaRatings: { ios: 'star', android: 'star', web: 'Star' }
}

interface FeatureInterestStepProps {
	idea: FeatureIdea
	value?: FeatureInterest
	onChange: (idea: FeatureIdea, level: FeatureInterest) => void
}

const FeatureInterestStep = ({
	idea,
	value,
	onChange
}: FeatureInterestStepProps): React.JSX.Element => {
	const { t } = useTranslation('settings')
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const icon = FEATURE_ICONS[idea]
	const featureName = t(`feedback.features.items.${idea}` as const)

	return (
		<View className="gap-6">
			<View className="items-center gap-4 pt-2">
				<View className="w-16 h-16 rounded-full items-center justify-center bg-primary-background">
					<PlatformIcon
						ios={{ name: icon.ios, size: 28 }}
						android={{ name: icon.android, size: 30 }}
						web={{ name: icon.web, size: 28 }}
						style={{ color: primaryColor }}
					/>
				</View>
				<View className="items-center gap-1.5 px-2">
					<Text className="text-label-secondary text-[13px] font-medium text-center">
						{t('feedback.features.prompt')}
					</Text>
					<View className="min-h-14 justify-center">
						<Text className="text-text text-[22px] font-semibold text-center leading-7">
							{featureName}
						</Text>
					</View>
				</View>
			</View>

			<View
				accessibilityRole="radiogroup"
				accessibilityLabel={featureName}
				className="gap-2"
			>
				{FEATURE_INTEREST_LEVELS.map((level) => {
					const isSelected = value === level
					const label = t(`feedback.features.levels.${level}` as const)

					return (
						<Pressable
							key={level}
							testID={`feedback-feature-${idea}-${level}`}
							accessibilityRole="radio"
							accessibilityState={{ checked: isSelected }}
							accessibilityLabel={t('feedback.features.accessibilityLabel', {
								feature: featureName,
								level: label
							})}
							onPress={() => {
								if (Platform.OS === 'ios') void selectionAsync()
								onChange(idea, level)
							}}
							className={`h-12 px-4 items-center justify-center rounded-base border active:opacity-70 ${
								isSelected
									? 'bg-primary-background border-primary'
									: 'bg-card-button border-transparent'
							}`}
						>
							<Text
								className={`text-[16px] ${
									isSelected ? 'text-primary font-semibold' : 'text-text'
								}`}
							>
								{label}
							</Text>
						</Pressable>
					)
				})}
			</View>
		</View>
	)
}

export default FeatureInterestStep
