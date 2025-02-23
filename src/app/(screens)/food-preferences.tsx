import MultiSectionRadio, {
	type FoodLanguageElement
} from '@/components/Food/FoodLanguageSection';
import FormList from '@/components/Universal/FormList';
import PlatformIcon, { chevronIcon } from '@/components/Universal/Icon';
import MultiSectionPicker from '@/components/Universal/MultiSectionPicker';
import SectionView from '@/components/Universal/SectionsView';
import SingleSectionPicker from '@/components/Universal/SingleSectionPicker';
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore';
import type { FormListSections } from '@/types/components';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

export default function FoodPreferences(): React.JSX.Element {
	const { t } = useTranslation('food');
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
	];

	const languages: FoodLanguageElement[] = [
		{
			key: 'default',
			title: t('preferences.languages.auto')
		},
		{ key: 'de', title: t('preferences.languages.de') },
		{ key: 'en', title: t('preferences.languages.en') }
	];
	const { styles } = useStyles(stylesheet);
	const router = useRouter();

	const selectedRestaurants = useFoodFilterStore(
		(state) => state.selectedRestaurants
	);
	const toggleSelectedRestaurant = useFoodFilterStore(
		(state) => state.toggleSelectedRestaurant
	);
	const showStatic = useFoodFilterStore((state) => state.showStatic);
	const setShowStatic = useFoodFilterStore((state) => state.setShowStatic);
	const foodLanguage = useFoodFilterStore((state) => state.foodLanguage);
	const toggleFoodLanguage = useFoodFilterStore(
		(state) => state.toggleFoodLanguage
	);

	const sections: FormListSections[] = [
		{
			header: 'Labels',
			items: [
				{
					title: t('preferences.formlist.allergens'),
					icon: chevronIcon,
					onPress: () => {
						router.navigate('/food-allergens');
					}
				},
				{
					title: t('preferences.formlist.flags'),
					icon: chevronIcon,
					onPress: () => {
						router.navigate('/food-flags');
					}
				}
			]
		}
	];

	return (
		<ScrollView>
			<View style={styles.container}>
				<SectionView title={'Restaurants'}>
					<MultiSectionPicker
						elements={elemtents}
						selectedItems={selectedRestaurants}
						action={toggleSelectedRestaurant}
					/>
				</SectionView>
				<SectionView title={'Filter'}>
					<SingleSectionPicker
						title={t('preferences.formlist.static')}
						selectedItem={showStatic ?? false}
						action={setShowStatic}
						state={false}
					/>
				</SectionView>
				<View style={styles.sectionContainer}>
					<FormList sections={sections} />
				</View>
				<SectionView title={t('preferences.formlist.language')}>
					<MultiSectionRadio
						elements={languages}
						selectedItem={foodLanguage}
						action={toggleFoodLanguage}
					/>
				</SectionView>
			</View>
			<View style={styles.sectionContainer}>
				<View style={styles.notesBox}>
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
					<Text style={styles.notesText}>{t('preferences.footer')}</Text>
				</View>
			</View>
		</ScrollView>
	);
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
		gap: 10,
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
}));
