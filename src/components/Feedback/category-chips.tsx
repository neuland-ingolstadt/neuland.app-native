import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import type { FeedbackCategory } from '@/api/neuland-core-api'

interface CategoryChipsProps {
	categories: readonly FeedbackCategory[]
	selected: FeedbackCategory[]
	onToggle: (category: FeedbackCategory) => void
}

const CategoryChips = ({
	categories,
	selected,
	onToggle
}: CategoryChipsProps): React.JSX.Element => {
	const { t } = useTranslation('settings')

	return (
		<View className="flex-row flex-wrap gap-2">
			{categories.map((category) => {
				const isSelected = selected.includes(category)

				return (
					<Pressable
						key={category}
						testID={`feedback-category-${category}`}
						accessibilityRole="checkbox"
						accessibilityState={{ checked: isSelected }}
						onPress={() => {
							void selectionAsync()
							onToggle(category)
						}}
						className={`px-3.5 py-2 rounded-infinite border active:opacity-70 ${
							isSelected
								? 'bg-primary-background border-primary'
								: 'bg-card-button border-transparent'
						}`}
					>
						<Text
							className={`text-[15px] ${
								isSelected ? 'text-primary font-semibold' : 'text-text'
							}`}
						>
							{t(`feedback.categories.${category}` as const)}
						</Text>
					</Pressable>
				)
			})}
		</View>
	)
}

export default CategoryChips
