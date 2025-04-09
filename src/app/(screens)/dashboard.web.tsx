import Divider from '@/components/Universal/Divider'
import PlatformIcon from '@/components/Universal/Icon'
import type { Card, ExtendedCard } from '@/components/all-cards'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { cardIcons } from '@/components/icons'
import { getDefaultDashboardOrder } from '@/contexts/dashboard'
import { USER_GUEST } from '@/data/constants'
import { arraysEqual } from '@/utils/app-utils'
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
import { ScrollView } from 'react-native-gesture-handler'
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
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['settings'])
	const [hasUserDefaultOrder, setHasUserDefaultOrder] = useState(true)
	const [unavailableCards, setUnavailableCards] = useState<Card[]>([])
	const [filteredHiddenDashboardEntries, setFilteredHiddenDashboardEntries] =
		useState<Card[]>([])
	const [transShownDashboardEntries, setTransShownDashboardEntries] = useState<
		ExtendedCard[]
	>([])

	// Calculate translated entries when shownDashboardEntries changes
	useEffect(() => {
		// add translation to shownDashboardEntries with new key transText
		const translatedEntries = shownDashboardEntries.map((item) => {
			return {
				...item,
				// @ts-expect-error cannot verify the type
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
				text: t(`cards.titles.${item.key}`, {
					ns: 'navigation'
				}) as string
			}
		})
		setTransShownDashboardEntries(translatedEntries)
	}, [shownDashboardEntries, t])

	useEffect(() => {
		setFilteredHiddenDashboardEntries(
			hiddenDashboardEntries.concat(unavailableCards)
		)
	}, [hiddenDashboardEntries, userKind, unavailableCards])

	const handleMoveItem = useCallback(
		(index: number, direction: 'up' | 'down') => {
			if (
				(direction === 'up' && index === 0) ||
				(direction === 'down' &&
					index === transShownDashboardEntries.length - 1)
			) {
				return // Can't move beyond boundaries
			}

			// Create a new array to avoid mutation issues
			const newOrderedEntries = [...transShownDashboardEntries]
			const newIndex = direction === 'up' ? index - 1 : index + 1

			// Swap the items
			const temp = newOrderedEntries[index]
			newOrderedEntries[index] = newOrderedEntries[newIndex]
			newOrderedEntries[newIndex] = temp

			// Apply animation for smooth UI updates
			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

			// Update state immediately to ensure UI reflects changes
			setTransShownDashboardEntries(newOrderedEntries)

			// Update the order in the context after state update
			setTimeout(() => {
				updateDashboardOrder(newOrderedEntries.map((x) => x.key))
			}, 0)

			// Provide haptic feedback
			if (Platform.OS === 'ios') {
				void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
			}
		},
		[transShownDashboardEntries]
	)

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
							{transShownDashboardEntries.length === 0 ? (
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
									{transShownDashboardEntries.map((item, index) => (
										<React.Fragment key={item.key}>
											<OrderableRowItem
												item={item}
												index={index}
												isLast={index === transShownDashboardEntries.length - 1}
												onMoveUp={() => handleMoveItem(index, 'up')}
												onMoveDown={() => handleMoveItem(index, 'down')}
												onPressDelete={() => {
													LayoutAnimation.configureNext(
														LayoutAnimation.Presets.easeInEaseOut
													)
													hideDashboardEntry(item.key)
												}}
												isFirstItem={index === 0}
												isLastItem={
													index === transShownDashboardEntries.length - 1
												}
											/>
											{index !== transShownDashboardEntries.length - 1 && (
												<Divider width={'100%'} />
											)}
										</React.Fragment>
									))}
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

interface OrderableRowItemProps {
	item: ExtendedCard
	index: number
	isLast: boolean
	onMoveUp: () => void
	onMoveDown: () => void
	onPressDelete: () => void
	isFirstItem: boolean
	isLastItem: boolean
}

function OrderableRowItem({
	item,
	isLast,
	onMoveUp,
	onMoveDown,
	onPressDelete,
	isFirstItem,
	isLastItem
}: OrderableRowItemProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const bottomWidth = isLast ? 0 : 1

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
				<View style={styles.iconContainer}>
					<PlatformIcon
						ios={{
							name: cardIcons[item.key as keyof typeof cardIcons].ios,
							size: 17
						}}
						android={{
							name: cardIcons[item.key as keyof typeof cardIcons].android,
							size: 21,
							variant: 'outlined'
						}}
						web={{
							name: cardIcons[item.key as keyof typeof cardIcons].web,
							size: 21
						}}
					/>
				</View>

				<Text style={styles.text}>{item.text}</Text>

				<View style={styles.actionButtons}>
					{/* Move Up Button */}
					<Pressable
						onPress={onMoveUp}
						disabled={isFirstItem}
						style={({ pressed }) => [
							styles.arrowButton,
							{
								opacity: isFirstItem ? 0.3 : pressed ? 0.7 : 1
							}
						]}
						accessibilityLabel="Move up"
					>
						<PlatformIcon
							ios={{
								name: 'chevron.up',
								size: 16
							}}
							android={{
								name: 'keyboard_arrow_up',
								size: 20
							}}
							web={{
								name: 'ChevronUp',
								size: 18
							}}
							style={styles.arrowIcon}
						/>
					</Pressable>

					{/* Move Down Button */}
					<Pressable
						onPress={onMoveDown}
						disabled={isLastItem}
						style={({ pressed }) => [
							styles.arrowButton,
							{
								opacity: isLastItem ? 0.3 : pressed ? 0.7 : 1
							}
						]}
						accessibilityLabel="Move down"
					>
						<PlatformIcon
							ios={{
								name: 'chevron.down',
								size: 16
							}}
							android={{
								name: 'keyboard_arrow_down',
								size: 20
							}}
							web={{
								name: 'ChevronDown',
								size: 18
							}}
							style={styles.arrowIcon}
						/>
					</Pressable>

					{/* Delete Button or empty spacer for alignment */}
					<View style={styles.deleteButtonContainer}>
						{item.removable ? (
							<Pressable
								onPress={onPressDelete}
								style={({ pressed }) => [
									styles.deleteButton,
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
								accessibilityLabel="Remove item"
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
							</Pressable>
						) : null}
					</View>
				</View>
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
	},
	actionButtons: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	arrowButton: {
		padding: 8,
		marginHorizontal: 2,
		justifyContent: 'center',
		alignItems: 'center'
	},
	arrowIcon: {
		color: theme.colors.text
	},
	iconContainer: {
		width: 24,
		alignItems: 'center',
		justifyContent: 'center'
	},
	deleteButtonContainer: {
		width: 24,
		marginLeft: 8,
		alignItems: 'center',
		justifyContent: 'center'
	},
	deleteButton: {
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
