import * as Haptics from 'expo-haptics'
import type React from 'react'
import { use, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutAnimation, Platform, Text, View } from 'react-native'
import DraggableFlatList, {
	ScaleDecorator
} from 'react-native-draggable-flatlist'
import { ScrollView } from 'react-native-gesture-handler'
import { useStyles } from 'react-native-unistyles'
import type { ExtendedCard } from '@/components/all-cards'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import {
	dashboardStyles,
	GuestUserNote,
	OrderableRowItem,
	ResetOrderButton
} from '@/components/Dashboard'
import { getDefaultDashboardOrder } from '@/contexts/dashboard'
import { USER_GUEST } from '@/data/constants'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { arraysEqual } from '@/utils/app-utils'

export default function DashboardEdit(): React.JSX.Element {
	const childrenHeight = 50
	const headerPadding = useTransparentHeaderPadding() + 12

	const { shownDashboardEntries, resetOrder, updateDashboardOrder } =
		use(DashboardContext)
	const { userKind = USER_GUEST } = use(UserKindContext)
	const { styles } = useStyles(dashboardStyles)
	const { t } = useTranslation(['settings'])
	const [hasUserDefaultOrder, setHasUserDefaultOrder] = useState(true)

	// add translation to shownDashboardEntries with new key transText
	const transShownDashboardEntries = shownDashboardEntries.map((item) => {
		return {
			...item,
			// @ts-expect-error cannot verify the type
			text: t(`cards.titles.${item.key}`, {
				ns: 'navigation'
			}) as string
		}
	})

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
				shownDashboardEntries.filter(Boolean).map((item) => item.key) || []
			)
		)
	}, [shownDashboardEntries, userKind])

	const renderItem = useCallback(
		({
			item,
			drag,
			isActive
		}: {
			item: ExtendedCard
			drag: () => void
			isActive: boolean
		}) => {
			return (
				<ScaleDecorator>
					<OrderableRowItem
						item={item}
						index={transShownDashboardEntries.findIndex(
							(x) => x.key === item.key
						)}
						isLast={
							transShownDashboardEntries[transShownDashboardEntries.length - 1]
								.key === item.key
						}
						onMoveUp={() => {}}
						onMoveDown={() => {}}
						isFirstItem={transShownDashboardEntries[0].key === item.key}
						isLastItem={
							transShownDashboardEntries[transShownDashboardEntries.length - 1]
								.key === item.key
						}
						drag={drag}
						isActive={isActive}
					/>
				</ScaleDecorator>
			)
		},
		[transShownDashboardEntries]
	)

	return (
		<View>
			<ScrollView
				contentContainerStyle={[styles.page, { paddingTop: headerPadding }]}
				bounces={false}
				contentInsetAdjustmentBehavior={
					headerPadding > 12 ? 'never' : 'automatic'
				}
			>
				<View style={styles.wrapper}>
					{userKind === USER_GUEST && <GuestUserNote />}

					<View style={styles.block}>
						<Text style={styles.blockHeader}>{t('dashboard.shown')}</Text>
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
									<DraggableFlatList
										data={transShownDashboardEntries}
										onDragBegin={() => {
											if (Platform.OS === 'ios') {
												void Haptics.impactAsync(
													Haptics.ImpactFeedbackStyle.Rigid
												)
											}
										}}
										onDragEnd={({ data }) => {
											updateDashboardOrder(data.map((x) => x.key))
											if (Platform.OS === 'ios') {
												void Haptics.impactAsync(
													Haptics.ImpactFeedbackStyle.Soft
												)
											}
										}}
										keyExtractor={(item) => item.key}
										renderItem={renderItem}
										containerStyle={styles.outer}
										activationDistance={10}
										autoscrollThreshold={50}
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
