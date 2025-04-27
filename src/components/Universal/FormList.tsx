import Divider from '@/components/Universal/Divider'
import type { FormListSections, SectionGroup } from '@/types/components'
import React from 'react'
import { Platform, Text, View, type ViewStyle } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

import { Pressable } from 'react-native'

import PlatformIcon from './Icon'

interface FormListProps {
	sections: FormListSections[]
	rowStyle?: ViewStyle
	privacyHidden?: boolean
}

interface RenderSectionFrameProps {
	sectionIndex: number
	children: React.ReactNode
	footer?: string
	header?: string
}

interface RenderSectionItemProps {
	sectionIndex: number
	section: FormListSections
}

const RenderSectionItem: React.FC<RenderSectionItemProps> = ({
	sectionIndex,
	section
}) => {
	const { styles } = useStyles(stylesheet)
	return (
		<View key={sectionIndex} style={styles.block}>
			<View style={[styles.blockCard, styles.itemBlock]}>
				<Text style={styles.columnDetails}>{section.item}</Text>
			</View>
		</View>
	)
}

const RenderSectionFrame: React.FC<RenderSectionFrameProps> = ({
	sectionIndex,
	children,
	footer,
	header
}) => {
	const { styles } = useStyles(stylesheet)

	return (
		<View key={sectionIndex} style={styles.block}>
			{header != null && <Text style={styles.blockHeader}>{header}</Text>}
			{children}
			{footer != null && <Text style={styles.blockFooter}>{footer}</Text>}
		</View>
	)
}

const RenderSectionItems: React.FC<{
	items: SectionGroup[]
	privacyHidden: boolean
	rowStyle?: ViewStyle
}> = ({ items, privacyHidden, rowStyle }) => {
	const { styles, theme } = useStyles(stylesheet)

	const handlePress = (onPress?: () => Promise<void> | void): void => {
		if (onPress != null) {
			Promise.resolve(onPress()).catch((error) => {
				console.error(error)
			})
		}
	}

	return (
		<View style={styles.blockCard}>
			{items.map((item, index) => (
				<React.Fragment key={index}>
					<Pressable
						onPress={() => {
							handlePress(item.onPress)
						}}
						style={({ pressed }) => [
							{
								opacity: pressed ? 0.9 : 1
							},
							styles.pressableContainer
						]}
						disabled={item.disabled ?? item.onPress === undefined}
					>
						<View
							style={{
								...(item.layout === 'column'
									? styles.cardColumn
									: styles.cardRow),
								...rowStyle
							}}
						>
							{item.icon != null && item.icon.endIcon !== true && (
								<View style={styles.leftIconContainer}>
									<PlatformIcon
										ios={{
											name: item.icon.ios,
											fallback: item.icon.iosFallback,
											size: (item.icon.iosFallback ?? false) ? 22 : 18
										}}
										android={{
											name: item.icon.android,
											size: 20,
											variant: item.icon.androidVariant ?? 'outlined'
										}}
										web={{
											name: item.icon.web,
											size: 20
										}}
										style={{
											color: item.iconColor ?? theme.colors.text
										}}
									/>
								</View>
							)}

							<View
								style={[
									styles.contentContainer,
									!item.icon && styles.contentWithoutIcon,
									item.layout === 'column' && styles.columnContentContainer
								]}
							>
								{item.title != null && (
									<Text style={styles.rowTitle}>{item.title}</Text>
								)}

								{item.value != null && !privacyHidden && (
									<Text
										style={[
											item.layout === 'column'
												? styles.columnDetails
												: styles.rowDetails,
											{
												color: item.textColor ?? theme.colors.labelColor,
												fontWeight: item.fontWeight ?? 'normal'
											}
										]}
										selectable={item.selectable ?? false}
									>
										{item.value}
									</Text>
								)}
							</View>

							{/* Add right padding container when there's a value but no chevron */}
							{item.value != null && (
								<View style={styles.rightPaddingContainer} />
							)}

							{item.icon?.endIcon ? (
								<View style={styles.chevronContainer}>
									<PlatformIcon
										ios={{
											name: item.icon.ios,
											fallback: item.icon.iosFallback,
											size: (item.icon.iosFallback ?? false) ? 22 : 18
										}}
										android={{
											name: item.icon.android,
											size: 20,
											variant: item.icon.androidVariant ?? 'outlined'
										}}
										web={{
											name: item.icon.web,
											size: 20
										}}
										style={{
											color: item.iconColor ?? theme.colors.text
										}}
									/>
								</View>
							) : (
								item.onPress != null &&
								item.hideChevron !== true &&
								item.value == null && (
									<View style={styles.chevronContainer}>
										<PlatformIcon
											ios={{
												name: 'chevron.right',
												size: 14,
												weight: 'semibold'
											}}
											android={{
												name: 'chevron_right',
												size: 16
											}}
											web={{
												name: 'ChevronRight',
												size: 16
											}}
											style={styles.chevronIcon}
										/>
									</View>
								)
							)}
						</View>
					</Pressable>

					{index < items.length - 1 && (
						<View style={styles.dividerContainer}>
							<Divider
								paddingLeft={
									item.icon && (item.icon.endIcon ?? false) !== true
										? 60
										: Platform.OS === 'ios'
											? 16
											: 0
								}
							/>
						</View>
					)}
				</React.Fragment>
			))}
		</View>
	)
}

/**
 * A component that renders a list of forms with headers and footers.
 * @param {FormListSections[]} sections - An array of sections, each containing a header, footer, and an array of items.
 * @returns {JSX.Element} - A React component that renders the list of forms.
 */
const FormList: React.FC<FormListProps> = ({
	sections,
	rowStyle,
	privacyHidden
}) => {
	const { styles } = useStyles(stylesheet)

	return (
		<View style={styles.wrapper}>
			{sections.map((section, sectionIndex) =>
				section.items !== undefined && section.items.length > 0 ? (
					<RenderSectionFrame
						key={sectionIndex}
						sectionIndex={sectionIndex}
						header={section.header}
						footer={section.footer}
					>
						<RenderSectionItems
							items={section.items}
							rowStyle={rowStyle}
							privacyHidden={privacyHidden ?? false}
						/>
					</RenderSectionFrame>
				) : section.item != null ? (
					<RenderSectionFrame
						key={sectionIndex}
						sectionIndex={sectionIndex}
						header={section.header}
						footer={section.footer}
					>
						<RenderSectionItem sectionIndex={sectionIndex} section={section} />
					</RenderSectionFrame>
				) : null
			)}
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	block: {
		gap: 6
	},
	blockCard: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		overflow: 'hidden'
	},
	blockFooter: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 12,
		fontWeight: '400'
	},
	blockHeader: {
		color: theme.colors.labelSecondaryColor,
		fontSize: 13,
		fontWeight: 'normal',
		textTransform: 'uppercase'
	},
	cardColumn: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		paddingVertical: 14,
		paddingHorizontal: 0
	},
	cardRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 15
	},
	columnDetails: {
		color: theme.colors.text,
		fontSize: 16,
		paddingTop: 2,
		textAlign: 'left'
	},
	itemBlock: {
		backgroundColor: theme.colors.card,
		borderRadius: theme.radius.md,
		paddingHorizontal: 16,
		paddingVertical: 13
	},
	rowDetails: {
		fontSize: 16,
		textAlign: 'right',
		paddingLeft: 1,
		flexShrink: 1
	},
	rowTitle: {
		color: theme.colors.text,
		fontSize: 16,
		paddingRight: 8
	},
	wrapper: {
		gap: 16,
		width: '100%'
	},
	pressableContainer: {
		width: '100%'
	},
	leftIconContainer: {
		width: 28,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 16
	},
	contentContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: 16,
		paddingRight: 8
	},
	contentWithoutIcon: {
		paddingLeft: 16
	},
	columnContentContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'flex-start',
		gap: 4
	},
	rightPaddingContainer: {
		marginRight: 12
	},
	chevronContainer: {
		marginRight: 16,
		alignItems: 'center',
		justifyContent: 'center',
		width: 16
	},
	chevronIcon: {
		color: theme.colors.labelTertiaryColor
	},
	dividerContainer: {
		width: '100%'
	}
}))

export default FormList
