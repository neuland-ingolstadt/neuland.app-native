import API from '@/api/authenticated-api'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Linking, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import BaseCard from './BaseCard'

const NewsCard: React.FC = () => {
	const ref = useRef(null)
	const { t } = useTranslation('navigation')
	const { styles } = useStyles(stylesheet)
	const { userKind = USER_GUEST } = useContext(UserKindContext)
	const { data } = useQuery({
		queryKey: ['thiNews'],
		queryFn: async () => await API.getThiNews(),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24, // 24 hours
		enabled: userKind !== USER_GUEST
	})

	return (
		<View ref={ref}>
			<BaseCard title="news" onPressRoute="/news">
				{data != null && data.length > 0 && (
					<View style={styles.newsContainer}>
						{data.slice(0, 2).map((newsItem, index) => (
							<React.Fragment key={index}>
								<Pressable
									style={styles.newsItemContainer}
									onPress={() => {
										void Linking.openURL(newsItem.href)
									}}
								>
									<Image
										style={styles.thumbnail}
										source={{
											uri: newsItem.img
										}}
									/>
									<Text style={styles.newsTitle} numberOfLines={2}>
										{newsItem.title}
									</Text>
								</Pressable>
							</React.Fragment>
						))}
					</View>
				)}
				{data != null && data.length > 3 && (
					<View style={styles.cardsFilled}>
						<Text style={styles.description}>
							{t('cards.news.more', {
								count: data.length
							})}
						</Text>
					</View>
				)}
			</BaseCard>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	cardsFilled: { paddingTop: 4 },
	newsContainer: {
		marginTop: 5,
		paddingVertical: 10,
		gap: 10
	},
	newsItemContainer: {
		flexDirection: 'row',
		padding: 8,
		borderRadius: theme.radius.md,
		alignItems: 'center',
		backgroundColor: theme.colors.cardButton
	},
	thumbnail: {
		width: '30%',
		maxWidth: 200,
		height: 65,
		borderRadius: theme.radius.sm,
		marginRight: 12
	},
	newsTitle: {
		color: theme.colors.text,
		fontSize: 16,
		fontWeight: '500',
		flex: 1
	},
	description: {
		color: theme.colors.labelColor,
		fontSize: 14,
		fontWeight: '500'
	}
}))

export default NewsCard
