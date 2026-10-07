import { FlashList } from '@shopify/flash-list'
import { selectionAsync } from 'expo-haptics'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, TextInput, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { getIndoorData } from '@/utils/indoor-nav'
import { listPickStartOptionsForQuery } from '@/utils/indoor-nav/start-endpoints'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

const OPTION_ROW_HEIGHT = 52
/** Fixed viewport — FlashList needs explicit height; shows ~4 scrollable rows. */
const LIST_VIEWPORT_HEIGHT = OPTION_ROW_HEIGHT * 4

export interface MapPickStartSheetChrome {
	title: string
	subtitle: string
	backAccessibilityLabel: string
	onBack: () => void
}

export interface DetailSheetPickStartProps {
	active: boolean
	searching: boolean
	chrome: MapPickStartSheetChrome | null
	session: number
	indoorDataReady: boolean
	startFromId: string
	startFromLabel: string
	onSelectFrom: (id: string) => void
	onConfirm: () => void
	onSearchingChange: (searching: boolean) => void
	onResetToDefault: () => void
}

interface IndoorNavStartSheetProps {
	indoorDataReady: boolean
	selectedFromId: string
	selectedFromLabel: string
	onSelectFrom: (id: string) => void
	onConfirm: () => void
	onSearchingChange?: (searching: boolean) => void
	onResetStartToDefault?: () => void
}

export function IndoorNavStartSheet({
	indoorDataReady,
	selectedFromId,
	selectedFromLabel,
	onSelectFrom,
	onConfirm,
	onSearchingChange,
	onResetStartToDefault
}: IndoorNavStartSheetProps): React.JSX.Element {
	const { t } = useTranslation(['indoor-nav', 'common'])
	const [browsing, setBrowsing] = useState(true)
	const [query, setQuery] = useState('')
	const skipCollapseRef = useRef(true)

	useEffect(() => {
		if (skipCollapseRef.current) {
			skipCollapseRef.current = false
			return
		}
		setBrowsing(false)
	}, [selectedFromId])

	const labelColor = toColor(useCSSVariable('--color-label'))
	const textColor = toColor(useCSSVariable('--color-text'))
	const primaryColor = String(
		toColor(useCSSVariable('--color-primary')) ?? '#007aff'
	)
	const contrastOnPrimary = getContrastColor(primaryColor)

	const showResults = query.trim() !== ''

	const options = useMemo(() => {
		if (!indoorDataReady || !showResults) {
			return []
		}
		return listPickStartOptionsForQuery(getIndoorData(), query, t)
	}, [indoorDataReady, query, showResults, t])

	const setQueryWithSheet = useCallback(
		(text: string) => {
			setQuery(text)
			onSearchingChange?.(text.trim() !== '')
		},
		[onSearchingChange]
	)

	const selectOption = useCallback(
		(id: string) => {
			if (Platform.OS === 'ios') {
				void selectionAsync()
			}
			onSelectFrom(id)
			onSearchingChange?.(false)
			setBrowsing(false)
		},
		[onSelectFrom, onSearchingChange]
	)

	const renderItem = useCallback(
		({
			item
		}: {
			item: ReturnType<typeof listPickStartOptionsForQuery>[0]
		}) => {
			const selected = item.id === selectedFromId
			return (
				<Pressable
					testID={`map-indoor-nav-start-option-${item.kind}`}
					onPress={() => {
						selectOption(item.id)
					}}
					accessibilityRole="radio"
					accessibilityState={{ selected }}
					className="h-[52px] flex-row items-center justify-between border-b-hairline border-border px-4 active:opacity-80"
				>
					<Text className="flex-1 text-base text-text mr-2" numberOfLines={2}>
						{item.label}
					</Text>
					{selected && (
						<PlatformIcon
							ios={{ name: 'checkmark.circle.fill', size: 18 }}
							android={{ name: 'check_circle', size: 21 }}
							web={{ name: 'Check', size: 18 }}
							style={{ color: primaryColor }}
						/>
					)}
				</Pressable>
			)
		},
		[primaryColor, selectOption, selectedFromId]
	)

	const listEmpty = useMemo(
		() => (
			<View className="flex-1 items-center justify-center px-4">
				<Text className="text-center text-[15px] text-label">
					{t('pickStartEmpty')}
				</Text>
			</View>
		),
		[t]
	)

	const openBrowse = useCallback(() => {
		setQuery('')
		onSearchingChange?.(false)
		setBrowsing(true)
	}, [onSearchingChange])

	const clearSearch = useCallback(() => {
		setQuery('')
		onSearchingChange?.(false)
		onResetStartToDefault?.()
		setBrowsing(false)
	}, [onResetStartToDefault, onSearchingChange])

	return (
		<View>
			{browsing ? (
				<>
					<Text className="text-[15px] leading-5 text-label">
						{t('pickStartMapHint')}
					</Text>

					<View className="mt-3 flex-row items-center min-h-11 gap-2">
						<View className="flex-1 flex-row items-center h-11 px-3 bg-card-sheet ios:rounded-ios android:rounded-md web:rounded-md border-hairline border-border">
							<PlatformIcon
								ios={{ name: 'magnifyingglass', size: 17, weight: 'medium' }}
								android={{ name: 'search', size: 22 }}
								web={{ name: 'Search', size: 18 }}
								style={{ color: labelColor }}
							/>
							<TextInput
								testID="map-indoor-nav-start-search"
								className="flex-1 text-[17px] h-11 ml-2"
								style={{ color: textColor }}
								placeholder={t('pickStartSearch')}
								placeholderTextColor={labelColor}
								value={query}
								onChangeText={setQueryWithSheet}
								autoCapitalize="none"
								autoCorrect={false}
								clearButtonMode="while-editing"
								enterKeyHint="search"
							/>
						</View>
						{query !== '' && (
							<Pressable
								testID="map-indoor-nav-start-search-clear"
								onPress={clearSearch}
								hitSlop={8}
								className="shrink-0 py-2"
								accessibilityRole="button"
								accessibilityLabel={t('misc.cancel', { ns: 'common' })}
							>
								<Text className="text-primary text-[15px] font-semibold">
									{t('misc.cancel', { ns: 'common' })}
								</Text>
							</Pressable>
						)}
					</View>

					{showResults && (
						<>
							<Text className="text-label-secondary ios:text-base ios:ml-[18px] ios:font-semibold android:text-[13px] android:font-normal android:uppercase mt-4 mb-1.5">
								{t('pickStartOptionsHeader')}
							</Text>
							<View
								className="bg-card-sheet ios:rounded-ios android:rounded-md web:rounded-md border-hairline border-border overflow-hidden"
								style={{ height: LIST_VIEWPORT_HEIGHT }}
							>
								<FlashList
									data={options}
									renderItem={renderItem}
									keyboardShouldPersistTaps="handled"
									ListEmptyComponent={listEmpty}
									extraData={selectedFromId}
									style={{ height: LIST_VIEWPORT_HEIGHT }}
									showsVerticalScrollIndicator
								/>
							</View>
						</>
					)}
				</>
			) : (
				<View className="flex-row items-center gap-3 rounded-xl border-hairline border-border bg-card-sheet px-4 py-3">
					<View className="flex-1 min-w-0">
						<Text className="text-[13px] text-label">{t('pickStartFrom')}</Text>
						<Text
							className="text-[17px] font-semibold text-text mt-0.5"
							numberOfLines={2}
						>
							{selectedFromLabel}
						</Text>
					</View>
					<Pressable
						testID="map-indoor-nav-start-edit"
						onPress={openBrowse}
						accessibilityRole="button"
						accessibilityLabel={t('pickStartEdit')}
						hitSlop={8}
						className="shrink-0 py-1"
					>
						<Text className="text-[17px] font-semibold text-primary">
							{t('pickStartEdit')}
						</Text>
					</Pressable>
				</View>
			)}

			<Pressable
				testID="map-indoor-nav-start-confirm"
				onPress={onConfirm}
				accessibilityRole="button"
				accessibilityLabel={t('pickStartConfirm')}
				className="mt-4 items-center rounded-xl px-4 py-3.5"
				style={{ backgroundColor: primaryColor }}
			>
				<Text
					className="text-[17px] font-bold"
					style={{ color: contrastOnPrimary }}
				>
					{t('pickStartConfirm')}
				</Text>
			</Pressable>
		</View>
	)
}
