// BaseCard Component to show the card on the dashboard to navigate to the corresponding page
import { USER_GUEST } from '@/data/constants'
import type React from 'react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { type RelativePathString, router } from 'expo-router'
import PlatformIcon from '../Universal/Icon'
import { DashboardContext, UserKindContext } from '../contexts'
import { cardIcons } from '../icons'
import { CardContextMenu } from './CardContextMenu'

interface BaseCardProps {
	title: string
	onPressRoute?: string
	removable?: boolean
	children?: React.ReactNode
}

const BaseCard: React.FC<BaseCardProps> = ({
	title,
	onPressRoute,
	children,
	removable = true // ugly but more efficient than iterating over all cards
}) => {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation('navigation')

	const { hideDashboardEntry, resetOrder } = useContext(DashboardContext)
	const { userKind = USER_GUEST } = useContext(UserKindContext)

	const foodKeys = ['mensa', 'mensaNeuburg', 'canisius', 'reimanns']
	const dynamicTitle = foodKeys.includes(title) ? 'food' : title

	const cardContent = (
		<View style={styles.card}>
			<View style={styles.titleView}>
				<PlatformIcon
					ios={{
						name: cardIcons[dynamicTitle as keyof typeof cardIcons]?.ios,
						size: 18
					}}
					android={{
						name: cardIcons[dynamicTitle as keyof typeof cardIcons]?.android,
						size: 24,
						variant: 'outlined'
					}}
					web={{
						name: cardIcons[dynamicTitle as keyof typeof cardIcons]?.web,
						size: 24
					}}
				/>
				<Text style={styles.title}>
					{/* @ts-expect-error cannot verify that title is a valid key */}
					{t(`cards.titles.${title}`)}
				</Text>
				{onPressRoute != null && (
					<PlatformIcon
						ios={{
							name: 'chevron.forward',
							size: 16
						}}
						android={{
							name: 'chevron_right',
							size: 26
						}}
						web={{
							name: 'ChevronRight',
							size: 24
						}}
						style={styles.labelColor}
					/>
				)}
			</View>
			{children != null && <>{children}</>}
		</View>
	)

	return (
		<CardContextMenu
			card={
				<Pressable
					disabled={onPressRoute == null}
					onPress={() => {
						if (onPressRoute != null) {
							router.navigate(onPressRoute as RelativePathString)
						}
					}}
					delayLongPress={300}
					onLongPress={() => {
						/* nothing */
					}}
				>
					{cardContent}
				</Pressable>
			}
			title={title}
			removable={removable}
			hideDashboardEntry={hideDashboardEntry}
			resetOrder={resetOrder}
			userKind={userKind}
		/>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	card: {
		backgroundColor: theme.colors.card,
		borderColor: theme.colors.border,
		borderRadius: theme.radius.md,
		padding: theme.margins.card,
		width: '100%'
	},
	labelColor: {
		color: theme.colors.labelColor
	},
	title: {
		color: theme.colors.text,
		flex: 1,
		fontSize: 16,
		fontWeight: '500',
		paddingBottom: Platform.OS === 'android' ? 2 : 0
	},
	titleView: {
		alignItems: 'center',
		color: theme.colors.text,
		flexDirection: 'row',
		gap: 10
	}
}))

export default BaseCard
