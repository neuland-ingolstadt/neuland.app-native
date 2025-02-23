/* eslint-disable react-native/no-color-literals */
import MapScreen, { requestPermission } from '@/components/Map/MapScreen';
import { MapContext } from '@/contexts/map';
import type { ClickedMapElement, SearchResult } from '@/types/map';
import type { AvailableRoom, FriendlyTimetableEntry } from '@/types/utils';
import { storage } from '@/utils/storage';
import Head from 'expo-router/head';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

export default function MapRootScreen(): React.JSX.Element {
	const { t } = useTranslation(['navigation']);
	const { styles } = useStyles(stylesheet);
	const [isPageOpen, setIsPageOpen] = useState(false);
	useEffect(() => {
		setIsPageOpen(true);
	}, []);
	const [localSearch, setLocalSearch] = useState<string>('');
	const [clickedElement, setClickedElement] =
		useState<ClickedMapElement | null>(null);
	const [availableRooms, setAvailableRooms] = useState<AvailableRoom[] | null>(
		null
	);
	const [currentFloor, setCurrentFloor] = useState({
		floor: 'EG',
		manual: false
	});
	const [nextLecture, setNextLecture] = useState<
		FriendlyTimetableEntry[] | null
	>(null);

	const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
	const updateSearchHistory = (newHistory: SearchResult[]): void => {
		setSearchHistory(newHistory);

		const jsonValue = JSON.stringify(newHistory);
		storage.set('mapSearchHistory', jsonValue);
	};

	const loadSearchHistory = (): void => {
		const jsonValue = storage.getString('mapSearchHistory');
		if (jsonValue != null) {
			try {
				const parsedValue = JSON.parse(jsonValue) as SearchResult[];
				setSearchHistory(parsedValue);
			} catch (error) {
				console.info('Failed to parse search history:', error);
			}
		} else {
			setSearchHistory([]);
		}
	};
	// Load search history on component mount
	useEffect(() => {
		void loadSearchHistory();
	}, []);

	const contextValue = {
		localSearch,
		setLocalSearch,
		clickedElement,
		setClickedElement,
		availableRooms,
		setAvailableRooms,
		currentFloor,
		setCurrentFloor,
		nextLecture,
		setNextLecture,
		searchHistory,
		setSearchHistory,
		updateSearchHistory
	};

	if (Platform.OS === 'android') {
		void requestPermission();
	}

	return (
		<>
			<Head>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<title>{t('navigation.map')}</title>
				<meta name="Campus Map" content="Interactive Campus Map" />
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>
			<SafeAreaView style={styles.page} edges={['bottom']}>
				{isPageOpen ? (
					<MapContext.Provider value={contextValue}>
						<MapScreen />
					</MapContext.Provider>
				) : (
					<></>
				)}
			</SafeAreaView>
		</>
	);
}

const stylesheet = createStyleSheet((theme) => ({
	page: {
		backgroundColor: theme.colors.background,
		flex: 1
	}
}));
