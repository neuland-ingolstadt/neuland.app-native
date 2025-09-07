import { FlashList } from '@shopify/flash-list'
import { selectionAsync } from 'expo-haptics'
import { useNavigation } from 'expo-router'
import type React from 'react'
import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import {
	createStyleSheet,
	UnistylesRuntime,
	useStyles
} from 'react-native-unistyles'
import PlatformIcon from '@/components/Universal/Icon'
import allergenMap from '@/data/allergens.json'
import flapMap from '@/data/mensa-flags.json'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import type { LanguageKey } from '@/localization/i18n'

interface PickerItem {
	key: string
	title: string
}

interface ItemsPickerScreenProps {
	type: string
}

const ItemsPickerScreen = ({
	type
}: ItemsPickerScreenProps): React.JSX.Element => {
	const data = type === 'allergens' ? allergenMap : flapMap
	const placeholderKey =
		type === 'allergens' ? 'allergensSearch' : 'flagsSearch'
	const isDark = UnistylesRuntime.themeName === 'dark'
	const { styles, theme } = useStyles(stylesheet)
	const { t, i18n } = useTranslation('food')
	const [searchQuery, setSearchQuery] = useState<string>('')

	let filteredEntries: PickerItem[] = Object.entries(data)
		.filter(([key]) => key !== '_source')
		.map(([key, value]) => ({
			key,
			title: value[i18n.language as LanguageKey]
		}))

	if (searchQuery) {
		filteredEntries = filteredEntries.filter((item) =>
			item.title.toLowerCase().includes(searchQuery.toLowerCase())
		)
	}

	const preferencesSelection = useFoodFilterStore(
		(state) => state.preferencesSelection
	)
	const toggleSelectedPreferences = useFoodFilterStore(
		(state) => state.toggleSelectedPreferences
	)
	const allergenSelection = useFoodFilterStore(
		(state) => state.allergenSelection
	)
	const toggleSelectedAllergens = useFoodFilterStore(
		(state) => state.toggleSelectedAllergens
	)

	filteredEntries.sort((a, b) => a.title.localeCompare(b.title))

	const navigation = useNavigation()

	useLayoutEffect(() => {
		navigation.setOptions({
			headerSearchBarOptions: {
				placeholder: t(`navigation.${placeholderKey}`, {
					ns: 'navigation'
				}),
				textColor: theme.colors.text,
				...Platform.select({
					android: {
						headerIconColor: theme.colors.text,
						hintTextColor: theme.colors.text
					}
				}),
				shouldShowHintSearchIcon: false,
				hideWhenScrolling: false,
				onChangeText: (event: { nativeEvent: { text: string } }) => {
					setSearchQuery(event.nativeEvent.text)
				}
			}
		})
	}, [navigation, isDark])

	const renderItem = ({ item }: { item: PickerItem }) => {
		const isSelected =
			type === 'allergens'
				? allergenSelection.includes(item.key)
				: preferencesSelection.includes(item.key)

		const toggleItem = () => {
			if (Platform.OS === 'ios') {
				void selectionAsync()
			}
			if (type === 'allergens') {
				toggleSelectedAllergens(item.key)
			} else {
				toggleSelectedPreferences(item.key)
			}
		}

		return (
			<View style={styles.itemContainer}>
				<Pressable style={styles.itemContent} onPress={toggleItem}>
					<Text style={styles.itemText}>{item.title}</Text>
					{isSelected && (
						<PlatformIcon
							ios={{
								name: 'checkmark.circle.fill',
								size: 18
							}}
							android={{
								name: 'check_circle',
								size: 21
							}}
							web={{
								name: 'Check',
								size: 18
							}}
							style={styles.checkIcon}
						/>
					)}
				</Pressable>
			</View>
		)
	}

	if (filteredEntries.length > 0) {
		return (
			<FlashList
				data={filteredEntries}
				renderItem={renderItem}
				estimatedItemSize={60}
				contentContainerStyle={styles.listContainer}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				disableAutoLayout
			/>
		)
	}
	return (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>
				{t(type === 'allergens' ? 'empty.allergens' : 'empty.flags')}
			</Text>
		</View>
	)
}

const Screen = (params: { route: { params: { type: string } } }) => {
	const type = params.route.params.type
	const { styles } = useStyles(stylesheet)

	return (
		<SafeAreaProvider>
			<SafeAreaView style={styles.page} edges={['top']}>
				<ItemsPickerScreen type={type} />
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	page: {
		flex: 1
	},
	container: {
		flex: 1,
		backgroundColor: theme.colors.background
	},
	listContainer: {
		paddingHorizontal: theme.margins.page,
		paddingBottom: theme.margins.bottomSafeArea,
		paddingTop: 10
	},
	itemContainer: {
		marginBottom: 8,
		height: 52
	},
	itemContent: {
		backgroundColor: theme.colors.card,
		borderRadius: 16,
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: '100%'
	},
	itemText: {
		color: theme.colors.text,
		fontSize: 16,
		flex: 1,
		marginRight: 8
	},
	checkIcon: {
		color: theme.colors.primary
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: theme.margins.page
	},
	emptyText: {
		color: theme.colors.labelColor,
		fontSize: 16,
		textAlign: 'center'
	}
}))

export default Screen
