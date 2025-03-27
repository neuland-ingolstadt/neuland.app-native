import Divider from '@/components/Universal/Divider'
import PlatformIcon from '@/components/Universal/Icon'
import type { Card, ExtendedCard } from '@/components/all-cards'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { cardIcons } from '@/components/icons'
import { getDefaultDashboardOrder } from '@/contexts/dashboard'
import { USER_GUEST } from '@/data/constants'
import { arraysEqual } from '@/utils/app-utils'
import { toast } from 'burnt'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Dimensions,
	LayoutAnimation,
	Platform,
	Pressable,
	Text,
	View
} from 'react-native'
import { DragSortableView } from 'react-native-drag-sort'
import { ScrollView } from 'react-native-gesture-handler'
import { runOnJS, runOnUI, useSharedValue } from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

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
	const { styles, theme } = useStyles(stylesheet)
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
	}, [resetOrder])

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
					{userKind === USER_GUEST && (
						<Pressable
							style={[styles.card, styles.noteContainer]}
							onPress={() => {
								router.navigate('/login')
							}}
						>
							<View style={styles.noteTextContainer}>
								<PlatformIcon
									ios={{
										name: 'lock',
										size: 20
									}}
									android={{
										name: 'lock',
										size: 24
									}}
									web={{
										name: 'Lock',
										size: 24
									}}
								/>
								<Text style={styles.notesTitle}>
									{t('dashboard.unavailable.title')}
								</Text>
							</View>

							<Text style={styles.notesMessage}>
								{t('dashboard.unavailable.message')}
							</Text>
						</Pressable>
					)}
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

					<View style={styles.block}>
						{filteredHiddenDashboardEntries.filter(Boolean).length > 0 && (
							<Text style={styles.sectionHeaderText}>
								{t('dashboard.hidden')}
							</Text>
						)}
						<View style={styles.card}>
							{filteredHiddenDashboardEntries
								.filter(Boolean)
								.map((item, index) => {
									return (
										<React.Fragment key={index}>
											<Pressable
												disabled={!item.removable}
												onPress={() => {
													handleRestore(item)
												}}
												hitSlop={10}
												style={({ pressed }) => [
													{
														opacity: pressed ? 0.5 : 1,
														minHeight: 46,
														justifyContent: 'center'
													}
												]}
											>
												<View style={styles.row}>
													<PlatformIcon
														style={styles.minusIcon}
														ios={{
															name: cardIcons[
																item.key as keyof typeof cardIcons
															].ios,
															size: 17
														}}
														android={{
															name: cardIcons[
																item.key as keyof typeof cardIcons
															].android,
															size: 21,
															variant: 'outlined'
														}}
														web={{
															name: cardIcons[
																item.key as keyof typeof cardIcons
															].web,
															size: 21
														}}
													/>
													<Text style={styles.text}>
														{t(
															// @ts-expect-error cannot verify the type
															`cards.titles.${item.key}`,
															{ ns: 'navigation' }
														)}
													</Text>
													{!item.removable ? (
														<PlatformIcon
															style={styles.minusIcon}
															ios={{
																name: 'lock',
																size: 20
															}}
															android={{
																name: 'lock',
																size: 24
															}}
															web={{
																name: 'Lock',
																size: 24
															}}
														/>
													) : (
														<PlatformIcon
															ios={{
																name: 'plus.circle',
																variant: 'fill',
																size: 20
															}}
															android={{
																name: 'add_circle',
																size: 24
															}}
															web={{
																name: 'CirclePlus',
																size: 24
															}}
															style={styles.restoreIcon}
														/>
													)}
												</View>
											</Pressable>
											{index !== filteredHiddenDashboardEntries.length - 1 && (
												<Divider width={'100%'} />
											)}
										</React.Fragment>
									)
								})}
						</View>
					</View>
					{!hasUserDefaultOrder && (
						<View style={[styles.card, styles.blockContainer]}>
							<Pressable onPress={handleReset} disabled={hasUserDefaultOrder}>
								<Text style={styles.reset(hasUserDefaultOrder)}>
									{t('dashboard.reset')}
								</Text>
							</Pressable>
						</View>
					)}
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
	const { styles, theme } = useStyles(stylesheet)
	const bottomWidth = isLast || isDragged ? 0 : 1

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
				<Pressable
					onPress={onPressDelete}
					disabled={!item.removable}
					style={({ pressed }) => [
						{
							opacity: pressed ? 0.5 : 1
						}
					]}
					hitSlop={{
						top: 13,
						right: 15,
						bottom: 13,
						left: 15
					}}
				>
					{item.removable && (
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
					)}
				</Pressable>
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	block: {
		alignSelf: 'center',
		gap: 6,
		width: '100%'
	},
	blockContainer: {
		backgroundColor: theme.colors.card,
		marginTop: 6
	},
	card: {
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		paddingHorizontal: 0
	},
	emptyContainer: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		justifyContent: 'center'
	},
	footer: {
		color: theme.colors.labelColor,
		fontSize: 12,
		fontWeight: 'normal',
		textAlign: 'left'
	},
	minusIcon: {
		color: theme.colors.labelSecondaryColor
	},
	noteContainer: {
		backgroundColor: theme.colors.card,
		marginTop: 3,
		paddingHorizontal: 12
	},
	noteTextContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 8,
		justifyContent: 'flex-start',
		paddingTop: 12,
		paddingVertical: 9
	},
	notesMessage: {
		color: theme.colors.text,
		fontSize: 15,
		marginBottom: 12,
		textAlign: 'left'
	},
	notesTitle: {
		color: theme.colors.primary,
		fontSize: 17,
		fontWeight: '600',
		textAlign: 'left'
	},
	outer: {
		borderRadius: theme.radius.md,
		flex: 1,
		overflow: 'hidden'
	},
	outerRow: {
		borderColor: theme.colors.border
	},
	page: {
		padding: theme.margins.page
	},
	reset: (hasUserDefaultOrder: boolean) => ({
		fontSize: 16,
		marginVertical: 13,
		alignSelf: 'center',
		color: hasUserDefaultOrder ? theme.colors.labelColor : theme.colors.text
	}),
	restoreIcon: {
		color: theme.colors.text
	},
	row: {
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		flexDirection: 'row',
		gap: 14,
		justifyContent: 'center',
		minHeight: 48,
		paddingHorizontal: 16
	},
	sectionHeaderText: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: 'normal',
		textTransform: 'uppercase'
	},
	shownBg: {
		backgroundColor: theme.colors.background
	},
	text: {
		color: theme.colors.text,
		flexGrow: 1,
		flexShrink: 1,
		fontSize: 16
	},
	textEmpty: {
		color: theme.colors.text,
		fontSize: 16,
		textAlign: 'center'
	},
	wrapper: {
		gap: 14
	}
}))
