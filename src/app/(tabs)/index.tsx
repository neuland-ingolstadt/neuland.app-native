import { FlashList, MasonryFlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import Head from 'expo-router/head'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Platform, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { getFragmentData } from '@/__generated__/gql'
import { AnnouncementFieldsFragmentDoc } from '@/__generated__/gql/graphql'
import NeulandAPI from '@/api/neuland-api'
import AnnouncementCard from '@/components/Cards/announcement-card'
import { DashboardContext } from '@/components/contexts'
import RueWarningBannerContainer from '@/components/Dashboard/rue-warning-banner-container'
import ErrorView from '@/components/Error/error-view'
import LogoSVG from '@/components/Flow/svgs/logo'
import { HomeHeaderRight } from '@/components/Home/home-header-right'
import WorkaroundStack from '@/components/Universal/workaround-stack'

export const unstable_settings = {
	initialRouteName: '/'
}

const DASHBOARD_MASONRY_BREAKPOINT = 800

const getDashboardColumnCount = (width: number): number =>
	Math.floor(width < DASHBOARD_MASONRY_BREAKPOINT ? 1 : 2)

const HeaderLeft = () => {
	const { styles } = useStyles(stylesheet)
	return (
		<View style={styles.headerLeft}>
			<LogoSVG size={24} />
		</View>
	)
}
export default function HomeRootScreen(): React.JSX.Element {
	const { t } = useTranslation(['navigation', 'common'])
	const [isPageOpen, setIsPageOpen] = useState(false)
	useEffect(() => {
		setIsPageOpen(true)
	}, [])

	return (
		<>
			<Head>
				<title>{t('meta.dashboardTitle', { ns: 'common' })}</title>
				<meta
					name="Dashboard"
					content={t('meta.dashboardDescription', { ns: 'common' })}
				/>
				<meta property="expo:handoff" content="true" />
				<meta property="expo:spotlight" content="true" />
			</Head>

			<WorkaroundStack
				name={'index'}
				titleKey={'navigation.dashboard'}
				component={isPageOpen ? HomeScreen : () => <></>}
				largeTitle={true}
				androidFallback
				headerRightElement={HomeHeaderRight}
				headerLeftElement={Platform.OS === 'web' ? HeaderLeft : undefined}
			/>
		</>
	)
}

const HomeScreen = memo(function HomeScreen() {
	const { styles, theme } = useStyles(stylesheet)
	const { shownDashboardEntries } = React.use(DashboardContext)
	const [orientation, setOrientation] = useState(Dimensions.get('window').width)
	const [columns, setColumns] = useState(
		getDashboardColumnCount(Dimensions.get('window').width)
	)
	const { t } = useTranslation(['navigation', 'settings'])
	const { data } = useQuery({
		queryKey: ['announcements'],
		queryFn: async () => await NeulandAPI.getAnnouncements(),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24 * 7 // 7 days
	})

	useEffect(() => {
		const handleOrientationChange = (): void => {
			const width = Dimensions.get('window').width
			setOrientation(width)
			setColumns(getDashboardColumnCount(width))
		}

		const subscription = Dimensions.addEventListener(
			'change',
			handleOrientationChange
		)

		return () => {
			subscription.remove()
		}
	}, [])
	const announcements = getFragmentData(
		AnnouncementFieldsFragmentDoc,
		data?.appAnnouncements
	)

	const announcementHeader = useMemo(
		() =>
			announcements != null ? <AnnouncementCard data={announcements} /> : null,
		[data]
	)

	const listHeader = useMemo(
		() => (
			<>
				<RueWarningBannerContainer />
				{announcementHeader}
			</>
		),
		[announcementHeader]
	)

	const renderSingleColumnItem = useCallback(
		// biome-ignore lint/suspicious/noExplicitAny: TODO
		({ item }: { item: any }) => <View style={styles.item}>{item.card()}</View>,
		[styles.item]
	)

	const renderMasonryItem = useCallback(
		// biome-ignore lint/suspicious/noExplicitAny: TODO
		({ item, index }: { item: any; index: number }) => {
			const paddingStyle =
				index % 2 === 0
					? { marginRight: theme.margins.page / 2 }
					: { marginLeft: theme.margins.page / 2 }

			return <View style={[styles.item, paddingStyle]}>{item.card()}</View>
		},
		[styles.item, theme.margins.page]
	)

	// biome-ignore lint/suspicious/noExplicitAny: TODO
	const keyExtractor = useCallback((item: { key: any }) => item.key, [])

	return shownDashboardEntries === null ||
		shownDashboardEntries.length === 0 ? (
		<View style={styles.errorContainer}>
			<ErrorView
				title={t('dashboard.noShown', { ns: 'settings' })}
				message={t('dashboard.noShownDescription', { ns: 'settings' })}
				icon={{
					ios: 'rainbow',
					multiColor: true,
					android: 'dashboard_customize',
					web: 'Cog'
				}}
				buttonText={t('dashboard.noShownButton', { ns: 'settings' })}
				onButtonPress={() => {
					router.navigate('/dashboard')
				}}
				isCritical={false}
			/>
		</View>
	) : columns === 1 ? (
		<FlashList
			estimatedItemSize={130}
			key={orientation}
			contentInsetAdjustmentBehavior="automatic"
			contentInset={{ top: 0, bottom: theme.margins.bottomSafeArea }}
			contentContainerStyle={{ ...styles.container, ...styles.page }}
			showsVerticalScrollIndicator={false}
			data={shownDashboardEntries}
			renderItem={renderSingleColumnItem}
			keyExtractor={keyExtractor}
			ListHeaderComponent={listHeader}
		/>
	) : (
		<MasonryFlashList
			key={orientation}
			contentInsetAdjustmentBehavior="automatic"
			contentInset={{ top: 0, bottom: theme.margins.bottomSafeArea }}
			contentContainerStyle={{ ...styles.container, ...styles.page }}
			showsVerticalScrollIndicator={false}
			data={shownDashboardEntries}
			renderItem={renderMasonryItem}
			keyExtractor={keyExtractor}
			numColumns={2}
			estimatedItemSize={114}
			ListHeaderComponent={listHeader}
		/>
	)
})

const stylesheet = createStyleSheet((theme) => ({
	container: {
		paddingTop: 6
	},
	errorContainer: { flex: 1, paddingTop: 110 },
	item: {
		gap: 0,
		marginHorizontal: theme.margins.page,
		marginVertical: 6
	},
	page: {
		backgroundColor: theme.colors.background
	},
	headerLeft: {
		paddingLeft: 16,
		paddingRight: 8
	}
}))
