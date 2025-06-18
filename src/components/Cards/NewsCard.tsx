import { useQuery } from '@tanstack/react-query'
import React, { use, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import API from '@/api/authenticated-api'
import { UserKindContext } from '@/components/contexts'
import { USER_GUEST } from '@/data/constants'

import BaseCard from './BaseCard'

const NewsCard: React.FC = () => {
	const ref = useRef(null)
	const { t } = useTranslation('navigation')
	const { t: tCommon } = useTranslation('common')
	const { styles } = useStyles(stylesheet)
	const { userKind = USER_GUEST } = use(UserKindContext)
	const { data, isSuccess } = useQuery({
		queryKey: ['thiNews'],
		queryFn: async () => await API.getThiNews(),
		staleTime: 1000 * 60 * 10, // 10 minutes
		gcTime: 1000 * 60 * 60 * 24, // 24 hours
		enabled: userKind !== USER_GUEST
	})

	const noData = (
		<Text style={styles.noDataText}>{tCommon('error.noData.title')}</Text>
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
		paddingVertical: 10,
		gap: 10
	},
	newsItemContainer: {
		flexDirection: 'row',
		padding: 8,
		borderRadius: theme.radius.md,
		alignItems: 'center',
		backgroundColor: theme.colors.cardButton,
		borderColor: theme.colors.border,
		borderWidth: StyleSheet.hairlineWidth
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
	},
	noDataText: {
		color: theme.colors.text,
		textAlign: 'center',
		marginTop: 10
	}
}))

export default NewsCard
