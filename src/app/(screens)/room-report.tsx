import { useMutation } from '@tanstack/react-query'
import { toast } from 'burnt'
import Color from 'color'
import { router, useLocalSearchParams } from 'expo-router'
import type React from 'react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	ActivityIndicator,
	Pressable,
	Text,
	useColorScheme,
	View
} from 'react-native'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import { useCSSVariable } from 'uniwind'
import type { RoomReportCategory } from '@/__generated__/gql/graphql'
import neulandApi from '@/api/neuland-api'
import { CustomDropdown } from '@/components/Menu/custom-dropdown'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import { getContrastColor } from '@/utils/ui-utils'
import { toColor } from '@/utils/uniwind-utils'

const reportCategories: RoomReportCategory[] = [
	'WRONG_DESCRIPTION',
	'WRONG_LOCATION',
	'NOT_EXISTING',
	'MISSING',
	'OTHER'
]

export default function RoomReport(): React.JSX.Element {
	const themePreference = usePreferencesStore((state) => state.theme)
	const systemScheme = useColorScheme()
	const isDark =
		themePreference === 'dark' ||
		(themePreference !== 'light' && systemScheme === 'dark')
	const primaryColor = useCSSVariable('--color-primary') as string
	const textColor = useCSSVariable('--color-text') as string | undefined
	const inputBackground = useCSSVariable('--color-input-background') as
		| string
		| undefined
	const borderColor = useCSSVariable('--color-border') as string | undefined

	const [reportCategory, setReportCategory] = useState<
		RoomReportCategory | undefined
	>()
	const { room } = useLocalSearchParams<{ room: string }>()

	const [description, setDescription] = useState<string>('')
	const [roomTitle, setRoomTitle] = useState<string>(room)

	const { t } = useTranslation('common')

	const { mutate, isPending } = useMutation({
		mutationFn: async (input: {
			room: string
			description: string
			reason: RoomReportCategory
		}) => {
			return await neulandApi.createRoomReport(input)
		},
		onSuccess: () => {
			toast({
				title: t('pages.rooms.report.reportSentSuccess'),
				preset: 'done',
				haptic: 'success',
				duration: 2.5,
				from: 'top'
			})
			router.back()
		},
		onError: (error, variables, context) => {
			toast({
				title: t('pages.rooms.report.reportSentError'),
				preset: 'error',
				haptic: 'error',
				duration: 2.5,
				from: 'top'
			})
			console.error(
				`Error when sending report ${error} ${variables} ${context}`
			)
		}
	})

	const submitDisabled =
		!(
			reportCategory !== undefined && reportCategories.includes(reportCategory)
		) ||
		description.trim() === '' ||
		room.trim() === '' ||
		isPending

	const textInputStyle = useMemo(
		() => ({
			backgroundColor: toColor(inputBackground),
			borderRadius: 17,
			color: toColor(textColor),
			flex: 1,
			fontSize: 17,
			height: 40,
			marginBottom: 10,
			paddingHorizontal: 10,
			borderColor: toColor(borderColor),
			borderWidth: 1
		}),
		[inputBackground, textColor, borderColor]
	)

	const contrastOnPrimary = getContrastColor(primaryColor)
	const submitButtonStyle = {
		backgroundColor: submitDisabled
			? isDark
				? Color(primaryColor).darken(0.3).hex()
				: Color(primaryColor).lighten(0.3).hex()
			: primaryColor
	}
	const buttonTextStyle = {
		color: submitDisabled
			? isDark
				? Color(contrastOnPrimary).lighten(0.1).hex()
				: Color(contrastOnPrimary).darken(0.1).hex()
			: contrastOnPrimary
	}

	return (
		<ScrollView contentContainerClassName="bg-background p-page">
			<View className="justify-center pb-5 pt-2.5">
				<View className="flex-row justify-between pb-2.5">
					<Text className="text-text text-[23px] font-semibold mb-3.5">
						{t('pages.rooms.report.title')}
					</Text>
				</View>

				<Text className="text-text text-[15px] pb-[5px]">
					{t('pages.rooms.report.room.title')}
				</Text>
				<TextInput
					style={textInputStyle}
					value={roomTitle}
					placeholder={t('pages.rooms.report.room.placeholder')}
					onChangeText={(text) => setRoomTitle(text)}
				/>

				<Text className="text-text text-[15px] pb-[5px]">
					{t('pages.rooms.report.category.title')}
				</Text>
				<CustomDropdown
					value={reportCategory}
					onChange={setReportCategory}
					options={reportCategories.map((category) => ({
						label: t(`pages.rooms.report.category.type.${category}` as const),
						value: category
					}))}
					placeholder={t('pages.rooms.report.category.placeholder')}
					style={textInputStyle}
				/>

				<Text className="text-text text-[15px] pb-[5px]">
					{t('pages.rooms.report.description.title')}
				</Text>
				<TextInput
					editable
					multiline
					numberOfLines={4}
					maxLength={2000}
					style={{
						...textInputStyle,
						height: 200,
						paddingTop: 10,
						textAlignVertical: 'top'
					}}
					placeholder={t('pages.rooms.report.description.placeholder')}
					value={description}
					onChangeText={(text) => setDescription(text)}
				/>

				<Pressable
					disabled={submitDisabled}
					onPress={() => {
						if (!reportCategory || !description || !room) return
						mutate({
							reason: reportCategory,
							description,
							room: room
						})
					}}
					className="h-10 justify-center px-page mt-[25px] rounded-md items-center"
					style={submitButtonStyle}
				>
					{isPending ? (
						<ActivityIndicator color={contrastOnPrimary} size={15} />
					) : (
						<Text className="font-bold text-[15px]" style={buttonTextStyle}>
							{t('submit')}
						</Text>
					)}
				</Pressable>
			</View>
			<View>
				<Text className="text-label text-sm text-left">
					{t('pages.rooms.report.footerText')}
				</Text>
			</View>
		</ScrollView>
	)
}
