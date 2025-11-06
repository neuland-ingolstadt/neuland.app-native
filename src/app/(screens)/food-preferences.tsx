import { useRouter } from 'expo-router'
import type React from 'react'
import { startTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import MultiSectionRadio, {
	type FoodLanguageElement
} from '@/components/Food/food-language-section'
import FormList from '@/components/Universal/form-list'
import PlatformIcon from '@/components/Universal/Icon'
import MultiSectionPicker from '@/components/Universal/multi-section-picker'
import SectionView from '@/components/Universal/sections-view'
import SingleSectionPicker from '@/components/Universal/single-section-picker'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { useWiggleAnimation } from '@/hooks/useWiggleAnimation'
import type { FormListSections } from '@/types/components'

export default function FoodPreferences(): React.JSX.Element {
	const { t } = useTranslation('food')
	const headerPadding = useTransparentHeaderPadding()
	const elemtents = [
		{
			key: 'IngolstadtMensa',
			title: t('cards.titles.mensa', { ns: 'navigation' })
		},
		{
			key: 'Reimanns',
			title: t('cards.titles.reimanns', { ns: 'navigation' })
		},
		{
			key: 'Canisius',
			title: t('cards.titles.canisius', { ns: 'navigation' })
		},
		{
			key: 'NeuburgMensa',
			title: t('cards.titles.mensaNeuburg', { ns: 'navigation' })
		}
	]

	const languages: FoodLanguageElement[] = [
		{
			key: 'default',
			title: t('preferences.languages.auto')
		},
		{ key: 'de', title: t('preferences.languages.de') },
		{ key: 'en', title: t('preferences.languages.en') }
	]
	const { styles } = useStyles(stylesheet)
	const { iconAnimatedStyle, triggerWiggle } = useWiggleAnimation()
	const router = useRouter()

	const selectedRestaurants = useFoodFilterStore(
		(state) => state.selectedRestaurants
	)
	const toggleSelectedRestaurant = useFoodFilterStore(
		(state) => state.toggleSelectedRestaurant
	)
	const showStatic = useFoodFilterStore((state) => state.showStatic)
	const setShowStatic = useFoodFilterStore((state) => state.setShowStatic)
	const foodLanguage = useFoodFilterStore((state) => state.foodLanguage)
	const toggleFoodLanguage = useFoodFilterStore(
		(state) => state.toggleFoodLanguage
	)
	const autoShowNextDay = usePreferencesStore((state) => state.autoShowNextDay)
	const setAutoShowNextDay = usePreferencesStore(
		(state) => state.setAutoShowNextDay
	)

	const handleToggleRestaurant = (name: string) => {
		startTransition(() => {
			toggleSelectedRestaurant(name)
		})
	}

	const handleSetShowStatic = (value: boolean) => {
		startTransition(() => {
			setShowStatic(value)
		})
	}

	const handleToggleLanguage = (language: string) => {
		startTransition(() => {
			toggleFoodLanguage(language)
		})
	}

	const sections: FormListSections[] = [
		{
			header: 'Labels',
			items: [
				{
					title: t('preferences.formlist.allergens'),
					onPress: () => {
						router.navigate('/food-allergens')
					}
				},
				{
					title: t('preferences.formlist.flags'),
					onPress: () => {
						router.navigate('/food-flags')
					}
				}
			]
		}
	]

	return (
		<ScrollView contentContainerStyle={{ paddingTop: headerPadding }}>
			<View style={styles.container}>
				<SectionView title={'Restaurants'}>
					<MultiSectionPicker
						elements={elemtents}
						selectedItems={selectedRestaurants}
						action={handleToggleRestaurant}
					/>
				</SectionView>
				<SectionView title={'Filter'}>
					<SingleSectionPicker
						title={t('preferences.formlist.static')}
						selectedItem={showStatic ?? false}
						action={handleSetShowStatic}
					/>
				</SectionView>
				<View style={styles.sectionContainer}>
					<FormList sections={sections} />
				</View>
				<SectionView title={t('preferences.formlist.language')}>
					<MultiSectionRadio
						elements={languages}
						selectedItem={foodLanguage}
						action={handleToggleLanguage}
					/>
				</SectionView>
				<SectionView title={t('preferences.settings')}>
					<SingleSectionPicker
						title={t('preferences.autoShowNextDay')}
						selectedItem={autoShowNextDay}
						action={setAutoShowNextDay}
					/>
				</SectionView>
			</View>
			<View style={styles.sectionContainer}>
				<Pressable onPress={triggerWiggle}>
					<View style={styles.notesBox}>
						<Animated.View style={iconAnimatedStyle}>
							<PlatformIcon
								ios={{
									name: 'exclamationmark.triangle',
									variant: 'fill',
									size: 21
								}}
								android={{
									name: 'warning',
									size: 24
								}}
								web={{
									name: 'TriangleAlert',
									size: 24
								}}
								style={styles.warningIcon}
							/>
						</Animated.View>
						<Text style={styles.notesText}>{t('preferences.footer')}</Text>
					</View>
				</Pressable>
			</View>
		</ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: { flex: 1 },
	notesBox: {
		alignContent: 'center',
		alignItems: 'center',
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		flexDirection: 'row',
		gap: 16,
		paddingHorizontal: 14,
		paddingVertical: 8,
		width: '100%'
	},
	notesText: {
		color: theme.colors.labelColor,
		flex: 1,
		flexShrink: 1,
		fontSize: 11,
		fontWeight: 'normal',
		textAlign: 'left'
	},
	sectionContainer: {
		alignSelf: 'center',
		marginTop: 16,
		paddingHorizontal: theme.margins.page,
		width: '100%'
	},
	warningIcon: {
		color: theme.colors.warning
	}
}))
