import { selectionAsync } from 'expo-haptics'
import { useNavigation } from 'expo-router'
import type React from 'react'
import { useLayoutEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { useCSSVariable, useUniwind } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { FlashList } from '@/components/Universal/styled'
import allergenMap from '@/data/allergens.json'
import flapMap from '@/data/mensa-flags.json'
import { useFoodFilterStore } from '@/hooks/useFoodFilterStore'
import type { LanguageKey } from '@/localization/i18n'
import { toColor } from '@/utils/uniwind-utils'

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
	const { theme } = useUniwind()
	const isDark = theme === 'dark'
	const textColor = toColor(useCSSVariable('--color-text'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))
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
				textColor,
				...Platform.select({
					android: {
						headerIconColor: textColor,
						hintTextColor: textColor
					}
				}),
				shouldShowHintSearchIcon: false,
				hideWhenScrolling: false,
				onChangeText: (event: { nativeEvent: { text: string } }) => {
					setSearchQuery(event.nativeEvent.text)
				}
			}
		})
	}, [navigation, isDark, textColor, t, placeholderKey])

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
			<View className="mb-2 h-[52px]">
				<Pressable
					className="bg-card rounded-2xl p-4 flex-row items-center justify-between h-full"
					onPress={toggleItem}
				>
					<Text className="text-text text-base flex-1 mr-2">{item.title}</Text>
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
							style={{ color: primaryColor }}
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
				contentContainerClassName="px-page pb-bottom-safe pt-2.5"
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				disableAutoLayout
			/>
		)
	}
	return (
		<View className="flex-1 justify-center items-center px-page">
			<Text className="text-label text-base text-center">
				{t(type === 'allergens' ? 'empty.allergens' : 'empty.flags')}
			</Text>
		</View>
	)
}

const Screen = (params: { route: { params: { type: string } } }) => {
	const type = params.route.params.type

	return (
		<SafeAreaProvider>
			<SafeAreaView className="flex-1" edges={['top']}>
				<ItemsPickerScreen type={type} />
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default Screen
