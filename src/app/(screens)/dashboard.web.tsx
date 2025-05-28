import {
	GuestUserNote,
	OrderableRowItem,
	ResetOrderButton,
	dashboardStyles
} from '@/components/Dashboard'
import Divider from '@/components/Universal/Divider'
import type { ExtendedCard } from '@/components/all-cards'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import { getDefaultDashboardOrder } from '@/contexts/dashboard'
import { USER_GUEST } from '@/data/constants'
import { arraysEqual } from '@/utils/app-utils'
import * as Haptics from 'expo-haptics'
import React, { useCallback, use, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutAnimation, Platform, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useStyles } from 'react-native-unistyles'

export default function DashboardEdit(): React.JSX.Element {
	const childrenHeight = 48

	const { shownDashboardEntries, resetOrder, updateDashboardOrder } =
		use(DashboardContext)
	const { userKind = USER_GUEST } = use(UserKindContext)
	const { styles, theme } = useStyles(dashboardStyles)
	const { t } = useTranslation(['settings'])
	const [hasUserDefaultOrder, setHasUserDefaultOrder] = useState(true)
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
			>
				<View style={styles.wrapper}>
					{userKind === USER_GUEST && <GuestUserNote />}

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
												isFirstItem={index === 0}
												isLastItem={
													index === transShownDashboardEntries.length - 1
												}
											/>
											{index !== transShownDashboardEntries.length - 1 && (
												<Divider
													width={'100%'}
													color={theme.colors.labelBackground}
												/>
											)}
										</React.Fragment>
									))}
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
