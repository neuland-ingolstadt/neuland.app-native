import { HeaderTitle } from '@react-navigation/elements'
import { Redirect, router, Stack } from 'expo-router'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, Platform, Text, View } from 'react-native'
import Animated, {
	interpolate,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue
} from 'react-native-reanimated'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import FormList from '@/components/Universal/form-list'
import useRouteParamsStore from '@/hooks/useRouteParamsStore'
import type { FormListSections } from '@/types/components'

export default function LecturerDetail(): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const lecturer = useRouteParamsStore((state) => state.selectedLecturer)
	const { t } = useTranslation('common')

	const scrollOffset = useSharedValue(0)
	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			if (scrollOffset && typeof scrollOffset.value !== 'undefined') {
				scrollOffset.value = event.contentOffset.y
			}
		}
	})

	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: interpolate(
						scrollOffset.value,
						[0, 30, 65],
						[25, 25, 0],
						'clamp'
					)
				}
			]
		}
	})

	if (lecturer == null) {
		return <Redirect href="/lecturers" />
	}

	const lecturerName = `${[lecturer?.titel, lecturer?.vorname, lecturer?.name]
		.join(' ')
		.trim()}`

	const validEmail =
		lecturer?.email === '' || !(lecturer?.email.includes('@') ?? false)

	const sections: FormListSections[] = [
		{
			header: 'Details',
			items: [
				{
					title: 'Name',
					value: `${lecturer?.vorname ?? ''} ${lecturer?.name ?? ''}`
				},
				{
					title: t('pages.lecturer.details.title'),
					value: lecturer?.titel
				},
				{
					title: t('pages.lecturer.details.organization'),
					value: t(`lecturerOrganizations.${lecturer?.organisation}`, {
						defaultValue: lecturer?.organisation,
						ns: 'api',
						fallbackLng: 'de'
					})
				},

				{
					title: t('pages.lecturer.details.function'),
					value: t(`lecturerFunctions.${lecturer?.funktion}`, {
						defaultValue: lecturer?.funktion,
						ns: 'api',
						fallbackLng: 'de'
					})
				}
			]
		},
		{
			header: t('pages.lecturer.contact.title'),
			items: [
				{
					title: t('pages.lecturer.contact.room'),
					value: lecturer?.room_short,
					disabled: lecturer?.room_short === '',
					textColor: theme.colors.primary,
					onPress: () => {
						if (lecturer?.room_short) {
							router.dismiss()
							router.push({
								pathname: '/(tabs)/map',
								params: { room: lecturer.room_short }
							})
						}
					}
				},
				{
					title: t('pages.lecturer.contact.phone'),
					value: lecturer?.tel_dienst,
					disabled: lecturer?.tel_dienst === '',
					textColor: theme.colors.primary,
					onPress: () => {
						void Linking.openURL(
							`tel:${lecturer?.tel_dienst?.replace(/\s+/g, '') ?? ''}`
						)
					}
				},
				{
					title: 'E-Mail',
					value: lecturer?.email,
					disabled: validEmail,
					layout: validEmail ? 'column' : 'row',
					textColor:
						(lecturer?.email.includes('@') ?? false)
							? theme.colors.primary
							: undefined,
					onPress: () => {
						void Linking.openURL(`mailto:${lecturer?.email ?? ''}`)
					}
				},
				{
					title: t('pages.lecturer.contact.office'),
					value: lecturer?.sprechstunde,
					layout: (lecturer?.sprechstunde?.length ?? 0) <= 20 ? 'row' : 'column'
				},
				{
					title: t('pages.lecturer.contact.exam'),
					value: lecturer?.einsichtnahme,
					layout:
						(lecturer?.einsichtnahme?.length ?? 0) <= 20 ? 'row' : 'column'
				}
			]
		}
	]

	return (
		<Animated.ScrollView
			style={styles.page}
			contentContainerStyle={styles.container}
			onScroll={scrollHandler}
			scrollEventThrottle={16}
		>
			<Stack.Screen
				options={{
					headerTitle: (props) => (
						<View style={styles.headerTitle}>
							<Animated.View style={headerStyle}>
								<HeaderTitle {...props} tintColor={theme.colors.text}>
									{lecturerName}
								</HeaderTitle>
							</Animated.View>
						</View>
					)
				}}
			/>

			<View style={styles.titleContainer}>
				<Text
					style={styles.titleText}
					adjustsFontSizeToFit
					minimumFontScale={0.8}
					numberOfLines={3}
				>
					{lecturerName}
				</Text>
			</View>
			<View style={styles.formList}>
				<FormList sections={sections} sheet />
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
		width: '100%',
		paddingBottom: 100
	},
	headerTitle: {
		marginBottom: Platform.OS === 'ios' ? -10 : 0,
		overflow: 'hidden',
		paddingRight: Platform.OS === 'ios' ? 0 : 50
	},
	page: {
		paddingHorizontal: theme.margins.page
	},
	titleContainer: {
		alignItems: 'flex-start',
		flexDirection: 'row',
		justifyContent: 'space-between'
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
