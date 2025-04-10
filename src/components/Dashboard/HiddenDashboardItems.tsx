import Divider from '@/components/Universal/Divider'
import PlatformIcon from '@/components/Universal/Icon'
import type { Card } from '@/components/all-cards'
import { cardIcons } from '@/components/icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

interface HiddenDashboardItemsProps {
	filteredHiddenDashboardEntries: Card[]
	handleRestore: (item: Card) => void
}

export default function HiddenDashboardItems({
	filteredHiddenDashboardEntries,
	handleRestore
}: HiddenDashboardItemsProps): React.JSX.Element | null {
	const { styles } = useStyles(stylesheet)
	const { t } = useTranslation(['settings'])

	if (filteredHiddenDashboardEntries.filter(Boolean).length === 0) {
		return null
	}

	return (
		<View style={styles.block}>
			<Text style={styles.sectionHeaderText}>{t('dashboard.hidden')}</Text>
			<View style={styles.card}>
				{filteredHiddenDashboardEntries.filter(Boolean).map((item, index) => {
					return (
						<React.Fragment key={index}>
							<Pressable
								disabled={!item.removable}
								onPress={() => {
									handleRestore(item)
								}}
								hitSlop={10}
								style={({ pressed }) => [
									{
										opacity: pressed ? 0.5 : 1,
										minHeight: 46,
										justifyContent: 'center'
									}
								]}
							>
								<View style={styles.row}>
									<PlatformIcon
										style={styles.minusIcon}
										ios={{
											name: cardIcons[item.key as keyof typeof cardIcons].ios,
											size: 17
										}}
										android={{
											name: cardIcons[item.key as keyof typeof cardIcons]
												.android,
											size: 21,
											variant: 'outlined'
										}}
										web={{
											name: cardIcons[item.key as keyof typeof cardIcons].web,
											size: 21
										}}
									/>
									<Text style={styles.text}>
										{t(
											// @ts-expect-error cannot verify the type
											`cards.titles.${item.key}`,
											{ ns: 'navigation' }
										)}
									</Text>
									{!item.removable ? (
										<PlatformIcon
											style={styles.minusIcon}
											ios={{
												name: 'lock',
												size: 20
											}}
											android={{
												name: 'lock',
												size: 24
											}}
											web={{
												name: 'Lock',
												size: 24
											}}
										/>
									) : (
										<PlatformIcon
											ios={{
												name: 'plus.circle',
												variant: 'fill',
												size: 20
											}}
											android={{
												name: 'add_circle',
												size: 24
											}}
											web={{
												name: 'CirclePlus',
												size: 24
											}}
											style={styles.restoreIcon}
										/>
									)}
								</View>
							</Pressable>
							{index !== filteredHiddenDashboardEntries.length - 1 && (
								<Divider width={'100%'} />
							)}
						</React.Fragment>
					)
				})}
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	block: {
		alignSelf: 'center',
		gap: 6,
		width: '100%'
	},
	card: {
		borderRadius: theme.radius.md,
		overflow: 'hidden',
		paddingHorizontal: 0
	},
	minusIcon: {
		color: theme.colors.labelSecondaryColor
	},
	restoreIcon: {
		color: theme.colors.text
	},
	row: {
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		flexDirection: 'row',
		gap: 14,
		justifyContent: 'center',
		minHeight: 48,
		paddingHorizontal: 16
	},
	sectionHeaderText: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: 'normal',
		textTransform: 'uppercase'
	},
	text: {
		color: theme.colors.text,
		flexGrow: 1,
		flexShrink: 1,
		fontSize: 16
	}
}))
