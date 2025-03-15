import { MapContext } from '@/contexts/map';
import { usePreferencesStore } from '@/hooks/usePreferencesStore';
import type { SearchResult } from '@/types/map';
import { trackEvent } from '@aptabase/react-native';
import Fuse from 'fuse.js';
import type { FeatureCollection } from 'geojson';
import type React from 'react';
import { memo, useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, SectionList, Text } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import Divider from '../Universal/Divider';
import ResultRow from './SearchResultRow';

interface SearchResultsProps {
	handlePresentModalPress: () => void;
	allRooms: FeatureCollection;
}

const SearchResults: React.FC<SearchResultsProps> = ({
	handlePresentModalPress,
	allRooms
}) => {
	const { styles } = useStyles(stylesheet);
	const { t, i18n } = useTranslation('common');
	const { searchHistory, updateSearchHistory, localSearch } =
		useContext(MapContext);
	const unlockedAppIcons = usePreferencesStore(
		(state) => state.unlockedAppIcons
	);
	const addUnlockedAppIcon = usePreferencesStore(
		(state) => state.addUnlockedAppIcon
	);
	useEffect(() => {
		if (
			localSearch.toLocaleLowerCase() === 'neuland' &&
			Platform.OS === 'ios'
		) {
			if (unlockedAppIcons.includes('retro')) {
				return;
			}
			Alert.alert(
				t('pages.map.easterEgg.title'),

				t('pages.map.easterEgg.message'),
				[
					{
						text: t('pages.map.easterEgg.confirm'),
						style: 'cancel'
					}
				],
				{ cancelable: false }
			);
			trackEvent('EasterEgg', { easterEgg: 'mapSearchNeuland' });

			addUnlockedAppIcon('retro');
		}
	}, [localSearch]);

	// Memoize fuse instance to avoid recreation on each render
	const fuse = useMemo(
		() =>
			new Fuse(allRooms.features, {
				keys: [
					'properties.Raum',
					i18n.language === 'de'
						? 'properties.Funktion_de'
						: 'properties.Funktion_en',
					'properties.Gebaeude'
				],
				threshold: 0.4,
				useExtendedSearch: true
			}),
		[allRooms.features, i18n.language]
	);

	const [searchResultsExact, searchResultsFuzzy] = useMemo(() => {
		const results = fuse.search(localSearch.trim().toUpperCase());
		const roomResults = results.map((result) => ({
			title: result.item.properties?.Raum as string,
			subtitle: result.item.properties?.Funktion_en as string,
			isExactMatch: Boolean(
				(result.item.properties?.Raum as string)
					.toUpperCase()
					.includes(localSearch.toUpperCase())
			),
			item: result.item
		}));

		const exactMatches = roomResults.filter((result) => result.isExactMatch);
		const fuzzyMatches = roomResults.filter((result) => !result.isExactMatch);

		return [exactMatches, fuzzyMatches];
	}, [localSearch, allRooms]);

	function addToSearchHistory(newHistory: SearchResult): void {
		const newSearchHistory = searchHistory.filter(
			(history) => history.title !== newHistory.title
		);

		newSearchHistory.unshift(newHistory);

		if (newSearchHistory.length > 5) {
			newSearchHistory.length = 5;
		}

		updateSearchHistory(newSearchHistory);
	}

	const renderItem = useCallback(
		({ item, index }: { item: SearchResult; index: number }) => (
			<ResultRow
				result={item}
				index={index}
				handlePresentModalPress={handlePresentModalPress}
				updateSearchHistory={addToSearchHistory}
			/>
		),
		[handlePresentModalPress, addToSearchHistory]
	);

	const renderSectionHeader = useCallback(
		({ section }: { section: { title: string; data: SearchResult[] } }) => (
			<Text style={styles.header}>{section.title}</Text>
		),
		[styles.header]
	);

	const itemSeparator = useCallback(() => <Divider iosPaddingLeft={50} />, []);

	// Performance optimization props for SectionList
	const sectionListProps = useMemo(
		() => ({
			windowSize: 5,
			maxToRenderPerBatch: 10,
			updateCellsBatchingPeriod: 50,
			removeClippedSubviews: true,
			initialNumToRender: 10
		}),
		[]
	);

	return searchResultsExact.length > 0 || searchResultsFuzzy.length > 0 ? (
		<SectionList
			contentContainerStyle={styles.contentContainer}
			keyboardShouldPersistTaps="always"
			sections={[
				...(searchResultsExact.length > 0
					? [
							{
								title: t('pages.map.search.results'),
								data: searchResultsExact
							}
						]
					: []),
				...(searchResultsFuzzy.length > 0
					? [
							{
								title: t('pages.map.search.fuzzy'),
								data: searchResultsFuzzy
							}
						]
					: [])
			]}
			keyExtractor={(item, index) => `${item.title}${index}`}
			renderItem={renderItem}
			ItemSeparatorComponent={itemSeparator}
			stickySectionHeadersEnabled={false}
			renderSectionHeader={renderSectionHeader}
			{...sectionListProps}
		/>
	) : (
		<Text style={styles.noResults}>{t('pages.map.search.noResults')}</Text>
	);
};

// Memoize the component to prevent unnecessary re-renders from parent
export default memo(SearchResults);

const stylesheet = createStyleSheet((theme) => ({
	contentContainer: {
		paddingBottom: theme.margins.bottomSafeArea
	},
	header: {
		color: theme.colors.text,
		fontSize: 20,
		fontWeight: '500',
		marginBottom: 2,
		paddingTop: 8,
		textAlign: 'left'
	},
	noResults: {
		color: theme.colors.text,
		fontSize: 16,
		paddingVertical: 30,
		textAlign: 'center'
	}
}));
