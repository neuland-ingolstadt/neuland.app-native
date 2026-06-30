import { HeaderTitle } from '@react-navigation/elements'
import { router, Stack } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset
} from 'react-native-reanimated'
import { useCSSVariable } from 'uniwind'
import FormList from '@/components/Universal/form-list'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { FormListSections } from '@/types/components'
import { formatFriendlyDateTime } from '@/utils/date-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function ExamDetail(): React.JSX.Element {
	const exam = useRouteParamsStore((state) => state.selectedExam)
	const { t } = useTranslation('common')
	const textColor = toColor(useCSSVariable('--color-text'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const typeSplit =
		exam?.type !== undefined ? exam?.type.split('-').slice(-1)[0].trim() : ''
	const type =
		typeSplit.length > 1
			? `${typeSplit[0].toUpperCase()}${typeSplit.slice(1)}`
			: exam?.type
	const examAids = exam?.aids ?? []
	const ref = useAnimatedRef<Animated.ScrollView>()
	const scroll = useScrollViewOffset(ref)
	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scroll.value,
						[0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		}
	})

	const sections: FormListSections[] = [
		{
			header: t('labels.details'),
			items: [
				{
					title: t('pages.exam.details.date'),
					value:
						formatFriendlyDateTime(exam?.date as unknown as string) ?? undefined
				},

				{
					title: t('pages.exam.details.room'),
					customComponent: (textStyle) => {
						return exam?.rooms?.includes(',') ? (
							<View className="flex-1 flex-row justify-end flex-wrap">
								{exam.rooms.split(',').map((r, index) => {
									const room = r.trim()
									return (
										<View key={index}>
											<Pressable
												className="flex-row items-center"
												onPress={() => {
													if (room) {
														router.dismissTo({
															pathname: '/map',
															params: { room: room }
														})
													}
												}}
											>
												<Text style={[textStyle, { color: primaryColor }]}>
													{room}
												</Text>
												{index < exam.rooms.split(',').length - 1 && (
													<Text style={textStyle}>, </Text>
												)}
											</Pressable>
										</View>
									)
								})}
							</View>
						) : (
							<Pressable
								onPress={() => {
									const singleRoom = exam?.rooms?.trim()
									if (singleRoom) {
										router.dismissTo({
											pathname: '/map',
											params: { room: singleRoom }
										})
									}
								}}
							>
								<Text style={[textStyle, { color: primaryColor }]}>
									{exam?.rooms?.trim()}
								</Text>
							</Pressable>
						)
					}
				},
				{
					title: t('pages.exam.details.seat'),
					value: exam?.seat
				},
				{
					title: t('pages.exam.details.tools'),
					value: (examAids.length > 1
						? examAids.map((aid) => {
								return `- ${aid}`
							})
						: examAids
					).join('\n'),
					layout: (exam?.aids?.length ?? 0) <= 1 ? 'row' : 'column'
				}
			]
		},
		{
			header: t('pages.exam.about.title'),
			items: [
				{
					title: t('pages.exam.about.type'),
					value: type
				},
				{
					title: t('pages.exam.about.examiner'),
					value: exam?.examiners?.join(', ')
				},
				{
					title: t('pages.exam.about.registration'),
					value:
						formatFriendlyDateTime(exam?.enrollment as unknown as string) ??
						undefined
				},
				{
					title: t('pages.exam.about.notes'),
					value: exam?.notes
				}
			]
		}
	]

	return (
		<Animated.ScrollView
			className="px-page"
			contentContainerClassName="gap-3 pb-modal-bottom"
			ref={ref}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View
							className="overflow-hidden"
							style={{
								marginBottom: Platform.OS === 'ios' ? -10 : 0,
								paddingRight: Platform.OS === 'ios' ? 0 : 50
							}}
						>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={String(textColor)}>
									{exam?.name}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>
			<View className="flex-row items-start justify-between pb-1.5">
				<Text
					className="text-text flex-1 text-2xl font-semibold pt-4 text-left"
					adjustsFontSizeToFit={true}
					numberOfLines={3}
					minimumFontScale={0.8}
					selectable={true}
				>
					{exam?.name}
				</Text>
			</View>
			<View className="self-center w-full">
				<FormList sections={sections} />
			</View>
			<View>
				<Text className="text-label text-[13px] text-left">
					{t('pages.exam.footer')}
				</Text>
			</View>
		</Animated.ScrollView>
	)
}
