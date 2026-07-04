import { trackEvent } from '@aptabase/react-native'
import { HeaderTitle } from '@react-navigation/elements'
import { Stack, useFocusEffect, useNavigation, useRouter } from 'expo-router'
import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Share, Text, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset
} from 'react-native-reanimated'
import ViewShot, { captureRef } from 'react-native-view-shot'
import { useCSSVariable } from 'uniwind'
import ErrorView from '@/components/Error/error-view'
import DetailsBody from '@/components/Timetable/details-body'
import DetailsRow from '@/components/Timetable/details-row'
import DetailsSymbol from '@/components/Timetable/details-symbol'
import Separator from '@/components/Timetable/separator'
import ShareCard from '@/components/Timetable/share-card'
import FormList from '@/components/Universal/form-list'
import PlatformIcon from '@/components/Universal/icon'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { FormListSections, SectionGroup } from '@/types/components'
import {
	diffInMinutes,
	formatFriendlyDate,
	formatFriendlyTime
} from '@/utils/date-utils'
import { getPlatformHeaderButtons } from '@/utils/header-buttons'
import { isValidRoom } from '@/utils/timetable-utils'
import { toColor } from '@/utils/uniwind-utils'

export default function TimetableDetails(): React.JSX.Element {
	const router = useRouter()
	const navigation = useNavigation()
	const { t } = useTranslation('timetable')
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelColor = toColor(useCSSVariable('--color-label'))
	const primaryColor = toColor(useCSSVariable('--color-primary'))
	const shareRef = useRef<ViewShot>(null)
	const lecture = useRouteParamsStore((state) => state.selectedLecture)
	const setHtmlContent = useRouteParamsStore((state) => state.setHtmlContent)
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
	useFocusEffect(
		useCallback(() => {
			if (lecture === undefined) {
				navigation.setOptions({
					...getPlatformHeaderButtons({})
				})
			} else {
				navigation.setOptions({
					...getPlatformHeaderButtons({
						onShare: shareEvent
					})
				})
			}
		}, [lecture, navigation])
	)

	if (lecture === undefined) {
		return <ErrorView title={t('error.cannotDisplayLecture')} />
	}

	const startDate = new Date(lecture.startDate)
	const endDate = new Date(lecture.endDate)

	const exam =
		lecture.exam != null
			? `${lecture.exam.split('-').slice(-1)[0].trim()[0].toUpperCase()}${lecture.exam.split('-').slice(-1)[0].trim().slice(1)}`
			: null

	async function shareEvent(): Promise<void> {
		try {
			const uri = await captureRef(shareRef, {
				format: 'png',
				quality: 1
			})
			trackEvent('Share', {
				type: 'lecture'
			})

			await Share.share({
				url: uri
			})
		} catch (e) {
			console.error(e)
		}
	}

	interface HtmlItem {
		title: 'overview.goal' | 'overview.content' | 'overview.literature'
		html: string | null
	}

	const createItem = (
		titleKey: HtmlItem['title'],
		html: HtmlItem['html']
	): SectionGroup | null => {
		if (html !== null) {
			return {
				title: t(titleKey),
				onPress: () => {
					setHtmlContent({
						title: t(titleKey),
						html: html ?? ''
					})
					router.navigate('/webview')
				}
			}
		}
		return null
	}

	const items = [
		createItem('overview.goal', lecture.goal),
		createItem('overview.content', lecture.contents),
		createItem('overview.literature', lecture.literature)
	].filter(Boolean) as SectionGroup[]

	const detailsList: FormListSections[] = [
		{
			header: t('overview.title'),
			items
		},
		{
			header: t('details.title'),
			items: [
				...(exam != null
					? [
							{
								title: t('details.exam'),
								value: exam,
								layout: 'column' as const
							}
						]
					: []),
				{
					title: t('details.studyGroup'),
					value: lecture.studyGroup
				},
				{
					title: t('details.courseOfStudies'),
					value: lecture.course
				},
				{
					title: t('details.weeklySemesterHours'),
					value: lecture.sws
				}
			]
		}
	]

	return (
		<Animated.ScrollView
			ref={ref}
			contentContainerClassName="flex pb-bottom-safe px-page pt-page"
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
									{lecture.name}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>
			<View>
				<DetailsRow>
					<DetailsSymbol>
						<View className="aspect-square bg-primary rounded-infinite w-[15px]" />
					</DetailsSymbol>
					<DetailsBody>
						<Text className="text-text text-2xl font-bold">{lecture.name}</Text>
						{lecture.shortName.length > 0 ? (
							<Text className="text-label text-sm">{lecture.shortName}</Text>
						) : (
							// biome-ignore lint/complexity/noUselessFragments: okay here
							<></>
						)}
					</DetailsBody>
				</DetailsRow>

				<Separator />

				<DetailsRow>
					<DetailsSymbol>
						<PlatformIcon
							style={{ color: labelColor }}
							ios={{
								name: 'clock',
								size: 21
							}}
							android={{
								name: 'calendar_month',
								size: 24,
								variant: 'outlined'
							}}
							web={{
								name: 'Clock',
								size: 24
							}}
						/>
					</DetailsSymbol>

					<DetailsBody>
						<View className="flex-row items-center flex-1 justify-between pr-3 w-full">
							<View>
								<Text className="text-text text-lg">
									{formatFriendlyDate(startDate, {
										weekday: 'long',
										relative: false
									})}
								</Text>

								<View className="flex-row items-center gap-1">
									<Text className="text-text text-sm">
										{formatFriendlyTime(startDate)}
									</Text>

									<PlatformIcon
										style={{ color: labelColor }}
										ios={{
											name: 'chevron.forward',
											size: 12
										}}
										android={{
											name: 'chevron_right',
											size: 16
										}}
										web={{
											name: 'ChevronRight',
											size: 16
										}}
									/>

									<Text className="text-text text-sm">
										{formatFriendlyTime(endDate)}
									</Text>

									<Text className="text-label text-sm">
										{`(${diffInMinutes(startDate, endDate)} ${t('time.minutes')})`}
									</Text>
								</View>
							</View>
							{}
						</View>
					</DetailsBody>
				</DetailsRow>

				{lecture.rooms.length > 0 ? (
					<>
						<Separator />
						<DetailsRow>
							<DetailsSymbol>
								<PlatformIcon
									ios={{
										name: 'mappin.and.ellipse',
										size: 21
									}}
									android={{
										name: 'place',
										size: 24,
										variant: 'outlined'
									}}
									web={{
										name: 'MapPin',
										size: 24
									}}
									style={{ color: labelColor }}
								/>
							</DetailsSymbol>

							<DetailsBody>
								<View className="flex-row">
									{lecture.rooms.map((room, i) => {
										const isValid = isValidRoom(room)
										return (
											<React.Fragment key={i}>
												<Pressable
													onPress={() => {
														router.dismissTo({
															pathname: '/(tabs)/map',
															params: {
																room
															}
														})
													}}
													disabled={!isValid}
												>
													<Text
														className="text-lg"
														style={{
															color: isValid ? primaryColor : textColor
														}}
													>
														{room}
													</Text>
												</Pressable>
												{i < lecture.rooms.length - 1 && (
													<Text className="text-text text-lg">{', '}</Text>
												)}
											</React.Fragment>
										)
									})}
								</View>
							</DetailsBody>
						</DetailsRow>
					</>
				) : null}

				{lecture.lecturer !== null ? (
					<>
						<Separator />
						<DetailsRow>
							<DetailsSymbol>
								<PlatformIcon
									ios={{
										name: 'person',
										size: 21
									}}
									android={{
										name: 'person',
										size: 24,
										variant: 'outlined'
									}}
									web={{
										name: 'User',
										size: 24
									}}
									style={{ color: labelColor }}
								/>
							</DetailsSymbol>

							<DetailsBody>
								<Text className="text-text text-lg">{lecture.lecturer}</Text>
							</DetailsBody>
						</DetailsRow>
					</>
				) : null}
				<View className="gap-3 mt-6">
					<FormList sections={detailsList} />
				</View>
				<ViewShot
					ref={shareRef}
					style={{
						transform: [{ translateX: -1000 }],
						position: 'absolute',
						zIndex: -1
					}}
				>
					<ShareCard event={lecture} />
				</ViewShot>
			</View>
		</Animated.ScrollView>
	)
}
