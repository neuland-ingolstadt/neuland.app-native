import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Pressable, Text, View } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'
import { TimetableAnimation } from './timetable-animation'

export const EmptyTimetableAnimation = ({
	isEmpty = false,
	onRefresh
}: {
	isEmpty?: boolean
	onRefresh?: () => void
}): React.JSX.Element => {
	const { t } = useTranslation('timetable')
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelColor = toColor(useCSSVariable('--color-label'))
	const borderColor = toColor(useCSSVariable('--color-border'))

	const handleConfigurePress = () => {
		void Linking.openURL('https://hiplan.thi.de/')
	}

	const handleRefreshPress = () => {
		onRefresh?.()
	}

	return (
		<Animated.View
			className="flex-1 items-center justify-center w-full px-5 py-2.5"
			entering={FadeIn.duration(600).delay(300)}
		>
			<View className="w-full max-w-[480px] items-center py-4">
				<View className="mb-10 items-center">
					<TimetableAnimation size={130} />
				</View>

				<View className="items-center w-full">
					<Text
						className="text-2xl font-bold mb-9 text-center"
						style={{ color: textColor }}
					>
						{isEmpty ? t('error.empty.title2') : t('error.empty.title')}
					</Text>

					<View className="w-full self-center mb-10 mt-2 gap-4 px-4">
						<View className="flex-row gap-5 items-center">
							<PlatformIcon
								ios={{
									name: 'calendar.badge.plus',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'event_available',
									size: 24
								}}
								web={{
									name: 'CalendarPlus',
									size: 24
								}}
								style={{ color: primaryColor }}
							/>
							<Text
								className="text-[15px] flex-1"
								style={{ color: labelColor }}
							>
								{t('error.empty.tip1')}
							</Text>
						</View>

						<View className="flex-row gap-5 items-center">
							<PlatformIcon
								ios={{
									name: 'person.crop.circle.badge.checkmark',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'verified_user',
									size: 24
								}}
								web={{
									name: 'UserCheck',
									size: 24
								}}
								style={{ color: primaryColor }}
							/>
							<Text
								className="text-[15px] flex-1"
								style={{ color: labelColor }}
							>
								{t('error.empty.tip2')}
							</Text>
						</View>

						<View className="flex-row gap-5 items-center">
							<PlatformIcon
								ios={{
									name: 'arrow.clockwise',
									size: 22,
									weight: 'semibold'
								}}
								android={{
									name: 'refresh',
									size: 24
								}}
								web={{
									name: 'RefreshCw',
									size: 24
								}}
								style={{ color: primaryColor }}
							/>
							<Text
								className="text-[15px] flex-1"
								style={{ color: labelColor }}
							>
								{t('error.empty.tip3')}
							</Text>
						</View>
					</View>

					<View className="w-full gap-3 items-center">
						<Pressable
							className="flex-row items-center justify-center py-3.5 px-5 ios:rounded-ios android:rounded-md web:rounded-md gap-2.5 min-w-[220px]"
							style={{ backgroundColor: primaryColor }}
							onPress={handleConfigurePress}
						>
							<Text className="text-base font-semibold text-white">
								{t('error.empty.button')}
							</Text>
							<PlatformIcon
								ios={{
									name: 'arrow.up.right',
									size: 18,
									weight: 'semibold'
								}}
								android={{
									name: 'open_in_new',
									size: 20
								}}
								web={{
									name: 'ExternalLink',
									size: 20
								}}
								style={{ color: 'white' }}
							/>
						</Pressable>

						<Pressable
							className="flex-row items-center justify-center bg-card py-3 px-[18px] ios:rounded-ios android:rounded-md web:rounded-md gap-2 min-w-[180px]"
							style={hairlineBorder}
							onPress={handleRefreshPress}
						>
							<Text
								className="text-[15px] font-medium"
								style={{ color: textColor, borderColor }}
							>
								{t('error.empty.refresh')}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Animated.View>
	)
}
