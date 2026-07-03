import { useQuery } from '@tanstack/react-query'
import React, { use, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Linking, Pressable, Text, View } from 'react-native'
import API from '@/api/authenticated-api'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { hairlineBorder } from '@/utils/uniwind-utils'

import BaseCard from './base-card'

const NewsCard = (): React.JSX.Element => {
	const ref = useRef(null)
	const { t } = useTranslation(['navigation', 'common'])
	const { userKind = USER_GUEST } = use(UserKindContext)
	const { data, isSuccess } = useQuery({
		queryKey: ['thiNews'],
		queryFn: async () => await API.getThiNews(),
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 60 * 24,
		enabled: userKind !== USER_GUEST
	})

	const noData = (
		<Text className="text-text text-center mt-2.5">
			{t('common:error.noData.title')}
		</Text>
	)

	return (
		<View ref={ref}>
			<BaseCard
				title="news"
				onPressRoute="/news"
				noDataComponent={noData}
				noDataPredicate={() => isSuccess && data.length === 0}
			>
				{data != null && data.length > 0 && (
					<View className="py-2.5 gap-2.5">
						{data.slice(0, 2).map((newsItem, index) => (
							<React.Fragment key={index}>
								<Pressable
									className="flex-row p-2 rounded-md items-center bg-card-button border-border"
									style={hairlineBorder}
									onPress={() => {
										void Linking.openURL(newsItem.href)
									}}
								>
									<Image
										className="w-[30%] max-w-[200px] h-[65px] rounded-[14px] mr-3"
										source={{
											uri: newsItem.img
										}}
									/>
									<Text
										className="text-text text-base font-medium flex-1"
										numberOfLines={2}
									>
										{newsItem.title}
									</Text>
								</Pressable>
							</React.Fragment>
						))}
					</View>
				)}
				{data != null && data.length > 3 && (
					<View className="pt-1">
						<Text className="text-label text-sm font-medium">
							{t('navigation:cards.news.more', {
								count: data.length
							})}
						</Text>
					</View>
				)}
			</BaseCard>
		</View>
	)
}

export default NewsCard
