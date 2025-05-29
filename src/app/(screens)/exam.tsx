import { HeaderTitle } from '@react-navigation/elements'
import { Stack } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Text, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import FormList from '@/components/Universal/FormList'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { FormListSections } from '@/types/components'
import { formatFriendlyDateTime } from '@/utils/date-utils'

export default function ExamDetail(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const exam = useRouteParamsStore((state) => state.selectedExam)
	const { t } = useTranslation('common')
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
			header: 'Details',
			items: [
				{
					title: t('pages.exam.details.date'),
					value:
						formatFriendlyDateTime(exam?.date as unknown as string) ?? undefined
				},

				{
					title: t('pages.exam.details.room'),
					value: exam?.rooms
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
			style={styles.page}
			contentContainerStyle={styles.container}
			ref={ref}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View style={styles.headerTitle}>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={theme.colors.text}>
									{exam?.name}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>
			<View style={styles.titleContainer}>
				<Text
					style={styles.titleText}
					adjustsFontSizeToFit={true}
					numberOfLines={3}
					minimumFontScale={0.8}
					selectable={true}
				>
					{exam?.name}
				</Text>
			</View>
			<View style={styles.formList}>
				<FormList sections={sections} />
			</View>
			<View>
				<Text style={styles.notesText}>{t('pages.exam.footer')}</Text>
			</View>
		</Animated.ScrollView>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	container: {
		gap: 12,
		paddingBottom: theme.margins.modalBottomMargin
	},
	formList: {
		alignSelf: 'center',
		width: '100%'
	},
	headerTitle: {
		marginBottom: Platform.OS === 'ios' ? -10 : 0,
		overflow: 'hidden',
		paddingRight: Platform.OS === 'ios' ? 0 : 50
	},
	notesText: {
		color: theme.colors.labelColor,
		fontSize: 13,
		textAlign: 'left'
	},
	page: {
		paddingHorizontal: theme.margins.page
	},

	titleContainer: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingBottom: 6
	},
	titleText: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 24,
		fontWeight: '600',
		paddingTop: 16,
		textAlign: 'left'
	}
}))
