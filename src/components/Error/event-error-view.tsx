import { router } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'
import { toColor } from '@/utils/uniwind-utils'

interface EventErrorViewProps {
	eventType: 'clEvents' | 'thiEvents' | 'sports'
	title?: string
	message?: string
}

function getEventTypeIcon(type: string): {
	ios: string
	android: MaterialIcon
	web: LucideIcon
} {
	switch (type) {
		case 'clEvents':
			return {
				ios: 'calendar',
				android: 'calendar_month' satisfies MaterialIcon,
				web: 'Calendar' satisfies LucideIcon
			}
		case 'thiEvents':
			return {
				ios: 'building.columns.fill',
				android: 'account_balance' satisfies MaterialIcon,
				web: 'Building2' satisfies LucideIcon
			}
		case 'sports':
			return {
				ios: 'figure.run',
				android: 'directions_run' satisfies MaterialIcon,
				web: 'Volleyball' satisfies LucideIcon
			}
		default:
			return {
				ios: 'calendar',
				android: 'calendar_month' satisfies MaterialIcon,
				web: 'Calendar' satisfies LucideIcon
			}
	}
}

export function EventErrorView({
	eventType,
	title,
	message
}: EventErrorViewProps): React.JSX.Element {
	const primaryColor = useCSSVariable('--color-primary')
	const { t } = useTranslation(['common', 'navigation'])

	const getEventTypeTitle = (type: string): string => {
		switch (type) {
			case 'clEvents':
				return t('pages.clEvents.events.title')
			case 'thiEvents':
				return t('navigation.thiEvents', { ns: 'navigation' })
			case 'sports':
				return t('pages.clEvents.sports.title')
			default:
				return t('pages.events.title')
		}
	}

	const handleBackToList = (): void => {
		if (router.canGoBack()) {
			router.back()
		} else {
			switch (eventType) {
				case 'clEvents':
					router.navigate('/cl-events')
					break
				case 'thiEvents':
					router.navigate('/thi-events')
					break
				case 'sports':
					router.navigate('/sports')
					break
			}
		}
	}

	return (
		<View className="flex-1 items-center justify-center p-4">
			<Animated.View className="w-full max-w-[400px] items-center justify-center rounded-2xl bg-card p-6">
				<PlatformIcon
					ios={{
						name: getEventTypeIcon(eventType).ios,
						size: 48
					}}
					android={{
						name: getEventTypeIcon(eventType).android as MaterialIcon,
						size: 48
					}}
					web={{
						name: getEventTypeIcon(eventType).web as LucideIcon,
						size: 48
					}}
					style={{ color: toColor(primaryColor) }}
				/>
				<View className="mt-6 w-full items-center">
					<View className="mb-4 flex-row items-center justify-center">
						<View className="mx-1 flex-1 items-center gap-1.5">
							<Text className="mb-1 text-center text-xl font-semibold text-text">
								{title ?? t('error.eventNotFound')}
							</Text>
							<Text className="text-center text-base text-text/80">
								{message ?? t('error.eventNotFoundDescription')}
							</Text>
						</View>
					</View>
					<Pressable
						className="mt-4 rounded-sm bg-primary px-4 py-2"
						onPress={handleBackToList}
					>
						<Text className="text-base font-semibold text-background">
							{t('error.backToEventList', {
								type: getEventTypeTitle(eventType)
							})}
						</Text>
					</Pressable>
				</View>
			</Animated.View>
		</View>
	)
}
