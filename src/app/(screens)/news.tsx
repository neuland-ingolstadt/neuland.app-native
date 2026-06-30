import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import {
	FlatList,
	Image,
	Linking,
	Pressable,
	RefreshControl,
	Text,
	useWindowDimensions,
	View
} from 'react-native'
import { useCSSVariable } from 'uniwind'
import API from '@/api/authenticated-api'
import ErrorView from '@/components/Error/error-view'
import Divider from '@/components/Universal/divider'
import PlatformIcon from '@/components/Universal/icon'
import LoadingIndicator from '@/components/Universal/loading-indicator'
import { useRefreshByUser } from '@/hooks'
import { useTransparentHeaderPadding } from '@/hooks/useTransparentHeader'
import { breakpoints } from '@/styles/breakpoints'
import { networkError } from '@/utils/api-utils'
import { formatFriendlyDate } from '@/utils/date-utils'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

export default function NewsScreen(): React.JSX.Element {
	const labelColor = toColor(useCSSVariable('--color-label'))
	const { width } = useWindowDimensions()
	const headerPadding = useTransparentHeaderPadding() + 12
	const isLargeScreen = width >= breakpoints.md
	const { data, error, isLoading, isError, isPaused, isSuccess, refetch } =
		useQuery({
			queryKey: ['thiNews'],
			queryFn: async () => await API.getThiNews(),
			staleTime: 1000 * 60 * 10,
			gcTime: 1000 * 60 * 60 * 24
		})
	const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch)

	return (
		<View className="flex-1 web:h-full">
			{isLoading ? (
				<View className="items-center justify-center ios:pt-[140px] android:pt-10">
					<LoadingIndicator />
				</View>
			) : isError ? (
				<View className="ios:h-[90%] android:h-full android:pt-[100px]">
					<ErrorView
						title={error.message}
						onRefresh={() => {
							void refetchByUser()
						}}
						refreshing={false}
					/>
				</View>
			) : isPaused && !isSuccess ? (
				<View className="ios:h-[90%] android:h-full android:pt-[100px]">
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
						<RefreshControl
							refreshing={isRefetchingByUser}
							onRefresh={() => {
								void refetchByUser()
							}}
						/>
					}
					keyExtractor={(item) => item.href}
					contentContainerClassName="gap-[18px] pb-modal-bottom p-page"
					contentContainerStyle={{ paddingTop: headerPadding }}
					renderItem={({ item }) => (
						<View className="self-center w-full" key={item.title}>
							<Text className="text-label-secondary ios:text-[15px] ios:ml-[18px] ios:font-semibold ios:pb-1.5 android:text-[13px] android:pb-1.5 android:font-normal android:uppercase">
								{formatFriendlyDate(item.date)}
							</Text>
							<Pressable
								className="self-center bg-card border-border rounded-md justify-center w-full"
								style={hairlineBorder}
								onPress={() => {
									void Linking.openURL(item.href)
								}}
							>
								{isLargeScreen ? (
									<View className="flex-row h-[200px]">
										<Image
											className="rounded-tl-md rounded-bl-md h-full aspect-video"
											style={{ objectFit: 'cover' }}
											source={{
												uri: item.img
											}}
										/>
										<View className="flex-1 justify-between p-2">
											<View className="items-center flex-row gap-2.5 mx-3 min-h-10">
												<Text
													className="text-text shrink flex-1 text-base font-bold my-2 text-left"
													numberOfLines={2}
												>
													{item.title}
												</Text>
												<PlatformIcon
													ios={{ name: 'chevron.forward', size: 12 }}
													android={{ name: 'chevron_right', size: 16 }}
													web={{ name: 'ChevronRight', size: 16 }}
													style={{ color: labelColor }}
												/>
											</View>
											<Divider width={'100%'} />
											<Text className="text-text text-sm mx-3 my-1.5">
												{item.teaser}
											</Text>
										</View>
									</View>
								) : (
									<>
										<Image
											className="rounded-t-md h-[200px]"
											style={{ objectFit: 'cover' }}
											source={{
												uri: item.img
											}}
										/>
										<View className="items-center flex-row gap-2.5 mx-3 min-h-10">
											<Text
												className="text-text shrink flex-1 text-base font-bold my-2 text-left"
												numberOfLines={2}
											>
												{item.title}
											</Text>
											<PlatformIcon
												ios={{ name: 'chevron.forward', size: 14 }}
												android={{ name: 'chevron_right', size: 16 }}
												web={{ name: 'ChevronRight', size: 16 }}
												style={{ color: labelColor }}
											/>
										</View>
										<Divider width={'100%'} />
										<Text className="text-text text-sm mx-3 my-1.5">
											{item.teaser}
										</Text>
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
