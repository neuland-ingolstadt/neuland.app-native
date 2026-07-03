import * as Haptics from 'expo-haptics'
import React, { use, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutAnimation, Platform, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useCSSVariable } from 'uniwind'
import type { ExtendedCard } from '@/components/all-cards'
import { DashboardContext, UserKindContext } from '@/components/contexts'
import {
	GuestUserNote,
	OrderableRowItem,
	ResetOrderButton
} from '@/components/Dashboard'
import Divider from '@/components/Universal/divider'
import { getDefaultDashboardOrder } from '@/contexts/dashboard'
import { useFeatureFlags } from '@/contexts/feature-flags'
import { USER_GUEST } from '@/data/constants'
import { arraysEqual } from '@/utils/app-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function DashboardEdit(): React.JSX.Element {
	const childrenHeight = 48
	const labelBackgroundColor = toColor(
		useCSSVariable('--color-label-background')
	)

	const { shownDashboardEntries, resetOrder, updateDashboardOrder } =
		use(DashboardContext)
	const { userKind = USER_GUEST } = use(UserKindContext)
	const flags = useFeatureFlags()
	const { t } = useTranslation(['settings'])
	const [hasUserDefaultOrder, setHasUserDefaultOrder] = useState(true)
	const [transShownDashboardEntries, setTransShownDashboardEntries] = useState<
		ExtendedCard[]
	>([])

	useEffect(() => {
		const translatedEntries = shownDashboardEntries.map((item) => {
			return {
				...item,
				// @ts-expect-error cannot verify the type
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
				return
			}

			const newOrderedEntries = [...transShownDashboardEntries]
			const newIndex = direction === 'up' ? index - 1 : index + 1

			const temp = newOrderedEntries[index]
			newOrderedEntries[index] = newOrderedEntries[newIndex]
			newOrderedEntries[newIndex] = temp

			LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

			setTransShownDashboardEntries(newOrderedEntries)

			setTimeout(() => {
				updateDashboardOrder(newOrderedEntries.map((x) => x.key))
			}, 0)

			if (Platform.OS === 'ios') {
				void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
			}
		},
		[transShownDashboardEntries, updateDashboardOrder]
	)

	const handleReset = useCallback(() => {
		resetOrder(userKind)
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
		if (Platform.OS === 'ios') {
			void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
		}
	}, [resetOrder, userKind])

	useEffect(() => {
		const { shown } = getDefaultDashboardOrder(userKind, flags)
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
	}, [shownDashboardEntries, userKind, flags])

	return (
		<View>
			<ScrollView
				contentContainerClassName="px-page pb-page"
				bounces={false}
				contentInsetAdjustmentBehavior="automatic"
			>
				<View className="gap-3.5">
					{userKind === USER_GUEST && <GuestUserNote />}

					<View className="self-center gap-1.5 w-full">
						<Text className="text-label-secondary ios:text-base ios:ml-[18px] ios:font-semibold ios:pb-1 android:text-[13px] android:font-normal android:uppercase">
							{t('dashboard.shown')}
						</Text>
						<View className="rounded-md overflow-hidden px-0 bg-background">
							{transShownDashboardEntries.length === 0 ? (
								<View
									className="bg-card rounded-md justify-center"
									style={{ height: childrenHeight * 1.5 }}
								>
									<Text className="text-text text-base text-center">
										{t('dashboard.noShown')}
									</Text>
								</View>
							) : (
								<View className="rounded-md flex-1 overflow-hidden">
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
												<Divider width={'100%'} color={labelBackgroundColor} />
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

					<Text className="text-label text-xs font-normal text-left">
						{t('dashboard.footer')}
					</Text>
				</View>
			</ScrollView>
		</View>
	)
}
