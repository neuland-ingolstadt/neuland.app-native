import { selectionAsync } from 'expo-haptics'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import type {
	FeatureIdea,
	FeatureInterest,
	FeatureInterestAnswers
} from '@/api/neuland-core-api'
import type { LucideIcon } from '@/components/Universal/icon'
import PlatformIcon from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'
import { FEATURE_INTEREST_LEVELS } from '@/utils/feedback-utils'
import { toColor } from '@/utils/uniwind-utils'

const FEATURE_ICONS: Record<
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
	}
}

interface FeatureInterestRowProps {
	idea: FeatureIdea
	value?: FeatureInterest
	onChange: (idea: FeatureIdea, level: FeatureInterest) => void
}

const FeatureInterestRow = ({
	idea,
	value,
	onChange
}: FeatureInterestRowProps): React.JSX.Element => {
	const { t } = useTranslation('settings')
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const icon = FEATURE_ICONS[idea]
	const featureName = t(`feedback.features.items.${idea}` as const)

	return (
		<View className="gap-2.5 py-3">
			<View className="flex-row items-center gap-2.5">
				<View className="w-6 items-center">
					<PlatformIcon
						ios={{ name: icon.ios, size: 16 }}
						android={{ name: icon.android, size: 20 }}
						web={{ name: icon.web, size: 18 }}
						style={{ color: primaryColor }}
					/>
				</View>
				<Text className="text-text text-[15px] font-medium flex-1">
					{featureName}
				</Text>
			</View>
			<View
				accessibilityRole="radiogroup"
				accessibilityLabel={featureName}
				className="flex-row gap-1.5"
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
								void selectionAsync()
								onChange(idea, level)
							}}
							className={`flex-1 h-9 px-1 items-center justify-center rounded-sm border active:opacity-70 ${
								isSelected
									? 'bg-primary-background border-primary'
									: 'bg-card-button border-transparent'
							}`}
						>
							<Text
								numberOfLines={1}
								adjustsFontSizeToFit
								minimumFontScale={0.8}
								className={`text-[13px] ${
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

interface FeatureInterestListProps {
	ideas: readonly FeatureIdea[]
	value: FeatureInterestAnswers
	onChange: (idea: FeatureIdea, level: FeatureInterest) => void
}

const FeatureInterestList = ({
	ideas,
	value,
	onChange
}: FeatureInterestListProps): React.JSX.Element => {
	return (
		<View>
			{ideas.map((idea, index) => (
				<React.Fragment key={idea}>
					{index > 0 && <View className="h-hairline bg-border" />}
					<FeatureInterestRow
						idea={idea}
						value={value[idea]}
						onChange={onChange}
					/>
				</React.Fragment>
			))}
		</View>
	)
}

export default FeatureInterestList
