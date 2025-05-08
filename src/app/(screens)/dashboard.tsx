import {
	GuestUserNote,
	OrderableRowItem,
	ResetOrderButton,
	dashboardStyles
} from '@/components/Dashboard'
import type { Card, ExtendedCard } from '@/components/all-cards'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { getDefaultDashboardOrder } from '@/contexts/dashboard'
import { USER_GUEST } from '@/data/constants'
import { arraysEqual } from '@/utils/app-utils'
import { toast } from 'burnt'
import * as Haptics from 'expo-haptics'
import type React from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, LayoutAnimation, Platform, Text, View } from 'react-native'
import { DragSortableView } from 'react-native-drag-sort'
import { ScrollView } from 'react-native-gesture-handler'
import { runOnJS, runOnUI, useSharedValue } from 'react-native-reanimated'
import { useStyles } from 'react-native-unistyles'

const { width } = Dimensions.get('window')

export default function DashboardEdit(): React.JSX.Element {
	const childrenHeight = 50

	const { shownDashboardEntries, resetOrder, updateDashboardOrder } =
		useContext(DashboardContext)
	const { userKind = USER_GUEST } = useContext(UserKindContext)
	const { styles, theme } = useStyles(dashboardStyles)
	const { t } = useTranslation(['settings'])
	const [draggedId, setDraggedId] = useState<number | null>(null)
	const [hasUserDefaultOrder, setHasUserDefaultOrder] = useState(true)

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

	const handleReset = useCallback(() => {
		resetOrder(userKind)
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		if (Platform.OS === 'ios') {
			void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
		}
	}, [resetOrder, userKind])

	useEffect(() => {
		const { shown } = getDefaultDashboardOrder(userKind)
		const defaultShown = shown.map((item) => item)

		if (shownDashboardEntries == null) {
			return
		}
		setHasUserDefaultOrder(
			arraysEqual(
				defaultShown,
				// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
				shownDashboardEntries.filter(Boolean).map((item) => item.key) || []
			)
		)
	}, [shownDashboardEntries, userKind])

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
										renderItem={(params: ExtendedCard, index: number) => (
											<OrderableRowItem
												item={params}
												index={index}
												isLast={
													shownDashboardEntries[
														shownDashboardEntries.length - 1
													].key === params.key
												}
												onMoveUp={() => {}}
												onMoveDown={() => {}}
												isFirstItem={index === 0}
												isLastItem={
													index === transShownDashboardEntries.length - 1
												}
											/>
										)}
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
