import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import {
	FlatList,
	Image,
	Linking,
	Platform,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	useWindowDimensions,
	View
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import API from '@/api/authenticated-api'
import ErrorView from '@/components/Error/error-view'
import Divider from '@/components/Universal/Divider'
import PlatformIcon from '@/components/Universal/Icon'
import LoadingIndicator from '@/components/Universal/LoadingIndicator'
import { useRefreshByUser } from '@/hooks'
import { breakpoints } from '@/styles/breakpoints'
import { networkError } from '@/utils/api-utils'
import { formatFriendlyDate } from '@/utils/date-utils'

export default function NewsScreen(): React.JSX.Element {
	const { styles } = useStyles(stylesheet)
	const { width } = useWindowDimensions()
	const isLargeScreen = width >= breakpoints.md
	const { data, error, isLoading, isError, isPaused, isSuccess, refetch } =
		useQuery({
			queryKey: ['thiNews'],
			queryFn: async () => await API.getThiNews(),
			staleTime: 1000 * 60 * 10, // 10 minutes
			gcTime: 1000 * 60 * 60 * 24 // 24 hours
		})
	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

	return (
		<View style={styles.rootContainer}>
			{isLoading ? (
				<View style={styles.loadingContainer}>
					<LoadingIndicator />
				</View>
			) : isError ? (
				<View style={styles.errorContainer}>
					<ErrorView
						title={error.message}
						onRefresh={() => {
							void refetchByUser()
						}}
						refreshing={false}
					/>
				</View>
			) : isPaused && !isSuccess ? (
				<View style={styles.errorContainer}>
					<ErrorView
						title={networkError}
						onRefresh={() => {
							void refetchByUser()
						}}
						refreshing={false}
					/>
				</View>
			) : isSuccess && data !== null ? (
				<FlatList
					data={data}
					refreshControl={
						isSuccess ? (
							<RefreshControl
								refreshing={isRefetchingByUser}
								onRefresh={() => {
									void refetchByUser()
								}}
							/>
						) : undefined
					}
					keyExtractor={(item) => item.href}
					contentContainerStyle={styles.contentContainer}
					renderItem={({ item }) => (
						<View style={styles.sectionContainer} key={item.title}>
							<Text style={styles.dateText}>
								{formatFriendlyDate(item.date)}
							</Text>
							<Pressable
								style={styles.sectionBox}
								onPress={() => {
									void Linking.openURL(item.href)
								}}
							>
								{isLargeScreen ? (
									<View style={styles.largeScreenLayout}>
										<Image
											style={styles.largeScreenImage}
											source={{
												uri: item.img
											}}
										/>
										<View style={styles.largeScreenContent}>
											<View style={styles.titleContainer}>
												<Text style={styles.titleText} numberOfLines={2}>
													{item.title}
												</Text>
												<PlatformIcon
													ios={{
														name: 'chevron.forward',
														size: 15
													}}
													android={{
														name: 'chevron_right',
														size: 16
													}}
													web={{
														name: 'ChevronRight',
														size: 16
													}}
													style={styles.icon}
												/>
											</View>
											<Divider width={'100%'} />
											<Text style={styles.teaserText}>{item.teaser}</Text>
										</View>
									</View>
								) : (
									<>
										<Image
											style={styles.imageContainer}
											source={{
												uri: item.img
											}}
										/>

										<View style={styles.titleContainer}>
											<Text style={styles.titleText} numberOfLines={2}>
												{item.title}
											</Text>
											<PlatformIcon
												ios={{
													name: 'chevron.forward',
													size: 15
												}}
												android={{
													name: 'chevron_right',
													size: 16
												}}
												web={{
													name: 'ChevronRight',
													size: 16
												}}
												style={styles.icon}
											/>
										</View>
										<Divider width={'100%'} />
										<Text style={styles.teaserText}>{item.teaser}</Text>
									</>
								)}
							</Pressable>
						</View>
					)}
				/>
			) : null}
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	contentContainer: {
		gap: 18,
		paddingBottom: theme.margins.modalBottomMargin,
		paddingTop: Platform.OS === 'ios' ? 105 : 5,
		padding: theme.margins.page
	},
	dateText: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: 'normal',
		marginBottom: 6,
		textTransform: 'uppercase'
	},
	errorContainer: {
		height: Platform.OS === 'ios' ? '90%' : '100%',
		paddingTop: Platform.OS === 'ios' ? 0 : 100
	},
	icon: {
		color: theme.colors.labelColor
	},
	imageContainer: {
		borderTopLeftRadius: theme.radius.md,
		borderTopRightRadius: theme.radius.md,
		height: 200,
		objectFit: 'cover'
	},
	largeScreenLayout: {
		flexDirection: 'row',
		height: 200
	},
	largeScreenImage: {
		borderTopLeftRadius: theme.radius.md,
		borderBottomLeftRadius: theme.radius.md,
		height: '100%',
		aspectRatio: 16 / 9,
		objectFit: 'cover'
	},
	largeScreenContent: {
		flex: 1,
		justifyContent: 'space-between',
		padding: 8
	},
	loadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: Platform.OS === 'ios' ? 140 : 40
	},
	rootContainer: {
		flex: 1,
		height: Platform.OS === 'web' ? '100%' : 'auto'
	},
	sectionBox: {
		alignSelf: 'center',
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderRadius: theme.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		justifyContent: 'center',
		width: '100%'
	},
	sectionContainer: {
		alignSelf: 'center',
		width: '100%'
	},
	teaserText: {
		color: theme.colors.text,
		fontSize: 14,
		marginHorizontal: 12,
		marginVertical: 6
	},
	titleContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		gap: 10,
		marginHorizontal: 12,
		minHeight: 40
	},
	titleText: {
		color: theme.colors.text,
		flexShrink: 1,
		flex: 1,
		fontSize: 16,
		fontWeight: '700',
		marginVertical: 8,
		textAlign: 'left'
	}
}))
