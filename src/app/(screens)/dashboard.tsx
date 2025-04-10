import {
	GuestUserNote,
	HiddenDashboardItems,
	ResetOrderButton,
	dashboardStyles
} from '@/components/Dashboard'
import PlatformIcon from '@/components/Universal/Icon'
import type { Card, ExtendedCard } from '@/components/all-cards'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { cardIcons } from '@/components/icons'
import { getDefaultDashboardOrder } from '@/contexts/dashboard'
import { USER_GUEST } from '@/data/constants'
import { arraysEqual } from '@/utils/app-utils'
import { toast } from 'burnt'
import * as Haptics from 'expo-haptics'
import type React from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Dimensions,
	type GestureResponderEvent,
	LayoutAnimation,
	Platform,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import { DragSortableView } from 'react-native-drag-sort'
import { ScrollView } from 'react-native-gesture-handler'
import { runOnJS, runOnUI, useSharedValue } from 'react-native-reanimated'
import { useStyles } from 'react-native-unistyles'

const { width } = Dimensions.get('window')

export default function DashboardEdit(): React.JSX.Element {
	const childrenHeight = 48

	const {
		shownDashboardEntries,
		hiddenDashboardEntries,
		hideDashboardEntry,
		bringBackDashboardEntry,
		resetOrder,
		updateDashboardOrder
	} = useContext(DashboardContext)
	const { userKind = USER_GUEST } = useContext(UserKindContext)
	const { styles, theme } = useStyles(dashboardStyles)
	const { t } = useTranslation(['settings'])
	const [draggedId, setDraggedId] = useState<number | null>(null)
	const [hasUserDefaultOrder, setHasUserDefaultOrder] = useState(true)
	const [unavailableCards, setUnavailableCards] = useState<Card[]>([])
	const [filteredHiddenDashboardEntries, setFilteredHiddenDashboardEntries] =
		useState<Card[]>([])

	// add translation to shownDashboardEntries with new key transText
	const transShownDashboardEntries = shownDashboardEntries.map((item) => {
		return {
			...item,
			// @ts-expect-error cannot verify the type
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			text: t(`cards.titles.${item.key}`, {
				ns: 'navigation'
			}) as string
		}
	})

	const newHoveredKeyShared = useSharedValue(-1)

	const updateHoveredKeyWorklet = (newKey: number): void => {
		'worklet'
		if (newHoveredKeyShared.value !== newKey) {
			if (Platform.OS === 'ios' && newHoveredKeyShared.value !== -1) {
				runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light)
			}
			newHoveredKeyShared.value = newKey
		}
	}

	const resetHoveredKey = (): void => {
		newHoveredKeyShared.value = -1
	}

	useEffect(() => {
		setFilteredHiddenDashboardEntries(
			hiddenDashboardEntries.concat(unavailableCards)
		)
	}, [hiddenDashboardEntries, userKind, unavailableCards])

	const renderItem = (params: ExtendedCard): React.JSX.Element => {
		const onPressDelete = (): void => {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
			hideDashboardEntry(params.key)
		}
		const isLast =
			shownDashboardEntries[shownDashboardEntries.length - 1].key === params.key

		return (
			<RowItem
				item={params}
				onPressDelete={onPressDelete}
				isLast={isLast}
				isDragged={
					draggedId !== null &&
					draggedId === transShownDashboardEntries.indexOf(params)
				}
			/>
		)
	}

	const handleRestore = useCallback(
		(item: Card) => {
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
			bringBackDashboardEntry(item.key)
		},
		[bringBackDashboardEntry]
	)

	const handleReset = useCallback(() => {
		resetOrder(userKind)
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		if (Platform.OS === 'ios') {
			void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
		}
	}, [resetOrder, userKind])

	useEffect(() => {
		const { hidden, shown } = getDefaultDashboardOrder(userKind)
		const defaultHidden = hidden.map((item) => item)
		const defaultShown = shown.map((item) => item)

		if (shownDashboardEntries == null) {
			return
		}
		setHasUserDefaultOrder(
			arraysEqual(
				defaultHidden,
				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				hiddenDashboardEntries.filter(Boolean).map((item) => item.key) || []
			) &&
				arraysEqual(
					defaultShown,
					// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
					shownDashboardEntries.filter(Boolean).map((item) => item.key) || []
				)
		)
	}, [shownDashboardEntries, hiddenDashboardEntries, userKind])

	useEffect(() => {
		const keys = getDefaultDashboardOrder(userKind).unavailable
		const cards = keys.map((key) => {
			return {
				key,
				removable: false,
				initial: [],
				allowed: [],
				card: () => <></>
			}
		})
		setUnavailableCards(cards)
	}, [userKind])

	return (
		<View>
			<ScrollView
				contentContainerStyle={styles.page}
				bounces={false}
				contentInsetAdjustmentBehavior="automatic"
				scrollEnabled={draggedId === null}
			>
				<View style={styles.wrapper}>
					{userKind === USER_GUEST && <GuestUserNote />}

					<View style={styles.block}>
						<Text style={styles.sectionHeaderText}>{t('dashboard.shown')}</Text>
						<View style={[styles.card, styles.shownBg]}>
							{shownDashboardEntries.length === 0 ? (
								<View
									style={{
										height: childrenHeight * 1.5,
										...styles.emptyContainer
									}}
								>
									<Text style={styles.textEmpty}>{t('dashboard.noShown')}</Text>
								</View>
							) : (
								<View style={styles.outer}>
									<DragSortableView
										keyExtractor={(item) =>
											// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
											item.key as string
										}
										dataSource={transShownDashboardEntries ?? []}
										childrenWidth={width}
										childrenHeight={childrenHeight}
										parentWidth={width}
										renderItem={renderItem}
										onDataChange={(data: Card[]) => {
											updateDashboardOrder(data.map((x) => x.key))
										}}
										onClickItem={() => {
											toast({
												title: t('toast.dashboard', {
													ns: 'common'
												}),
												preset: 'custom',
												haptic: 'warning',
												duration: 2,
												from: 'top',
												icon: {
													ios: {
														name: 'hand.draw',
														color: theme.colors.primary
													}
												}
											})
										}}
										onDragging={(
											_gestureState: unknown,
											_left: number,
											_top: number,
											moveToIndex: number
										) => {
											runOnUI(updateHoveredKeyWorklet)(moveToIndex)
										}}
										onDragStart={(index: number) => {
											setDraggedId(index)
											if (Platform.OS === 'ios') {
												void Haptics.impactAsync(
													Haptics.ImpactFeedbackStyle.Rigid
												)
											}
										}}
										onDragEnd={() => {
											resetHoveredKey()
											setDraggedId(null)
											if (Platform.OS === 'ios') {
												void Haptics.impactAsync(
													Haptics.ImpactFeedbackStyle.Soft
												)
											}
										}}
										maxScale={1.05}
										delayLongPress={100}
									/>
								</View>
							)}
						</View>
					</View>

					<HiddenDashboardItems
						filteredHiddenDashboardEntries={filteredHiddenDashboardEntries}
						handleRestore={handleRestore}
					/>

					<ResetOrderButton
						hasUserDefaultOrder={hasUserDefaultOrder}
						onPress={handleReset}
					/>

					<Text style={styles.footer}>{t('dashboard.footer')}</Text>
				</View>
			</ScrollView>
		</View>
	)
}

interface RowItemProps {
	item: ExtendedCard
	onPressDelete: () => void
	isLast: boolean
	isDragged: boolean
}

function RowItem({
	item,
	onPressDelete,
	isLast,
	isDragged
}: RowItemProps): React.JSX.Element {
	const { styles, theme } = useStyles(dashboardStyles)
	const bottomWidth = isLast || isDragged ? 0 : 1

	const handleDeletePress = (e: GestureResponderEvent) => {
		e?.stopPropagation?.()
		if (item.removable) {
			onPressDelete()
		}
	}

	return (
		<View>
			<View
				style={[
					styles.row,
					styles.outerRow,
					{
						width: width - theme.margins.page * 2,
						borderBottomWidth: bottomWidth
					}
				]}
			>
				<PlatformIcon
					ios={{
						name: isDragged
							? 'line.3.horizontal'
							: cardIcons[item.key as keyof typeof cardIcons].ios,
						size: 17
					}}
					android={{
						name: isDragged
							? 'drag_handle'
							: cardIcons[item.key as keyof typeof cardIcons].android,
						size: 21,
						variant: 'outlined'
					}}
					web={{
						name: isDragged
							? 'GripHorizontal'
							: cardIcons[item.key as keyof typeof cardIcons].web,
						size: 21
					}}
				/>

				<Text style={styles.text}>{item.text}</Text>

				<TouchableOpacity
					onPress={handleDeletePress}
					activeOpacity={0.5}
					style={{ opacity: item.removable ? 1 : 0 }}
					disabled={!item.removable}
					hitSlop={{
						top: 13,
						right: 15,
						bottom: 13,
						left: 15
					}}
				>
					<PlatformIcon
						ios={{
							name: 'minus.circle',
							size: 20
						}}
						android={{
							name: 'do_not_disturb_on',
							variant: 'outlined',
							size: 24
						}}
						web={{
							name: 'CircleMinus',
							size: 24
						}}
						style={styles.minusIcon}
					/>
				</TouchableOpacity>
			</View>
		</View>
	)
}
