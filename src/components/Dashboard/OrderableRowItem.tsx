import PlatformIcon from '@/components/Universal/Icon'
import type { ExtendedCard } from '@/components/all-cards'
import { cardIcons } from '@/components/icons'
import type React from 'react'
import { Dimensions, Pressable, Text, View } from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'

const { width } = Dimensions.get('window')

interface OrderableRowItemProps {
	item: ExtendedCard
	index: number
	isLast: boolean
	onMoveUp: () => void
	onMoveDown: () => void
	onPressDelete: () => void
	isFirstItem: boolean
	isLastItem: boolean
}

export default function OrderableRowItem({
	item,
	isLast,
	onMoveUp,
	onMoveDown,
	onPressDelete,
	isFirstItem,
	isLastItem
}: OrderableRowItemProps): React.JSX.Element {
	const { styles, theme } = useStyles(stylesheet)
	const bottomWidth = isLast ? 0 : 1

	return (
		<View>
			<View
				style={[
					styles.row,
					styles.outerRow,
					{
						width: width - theme.margins.page * 2,
						borderBottomWidth: bottomWidth
					}
				]}
			>
				<View style={styles.iconContainer}>
					<PlatformIcon
						ios={{
							name: cardIcons[item.key as keyof typeof cardIcons].ios,
							size: 17
						}}
						android={{
							name: cardIcons[item.key as keyof typeof cardIcons].android,
							size: 21,
							variant: 'outlined'
						}}
						web={{
							name: cardIcons[item.key as keyof typeof cardIcons].web,
							size: 21
						}}
					/>
				</View>

				<Text style={styles.text}>{item.text}</Text>

				<View style={styles.actionButtons}>
					{/* Move Up Button */}
					<Pressable
						onPress={onMoveUp}
						disabled={isFirstItem}
						style={({ pressed }) => [
							styles.arrowButton,
							{
								opacity: isFirstItem ? 0.3 : pressed ? 0.7 : 1
							}
						]}
						accessibilityLabel="Move up"
					>
						<PlatformIcon
							ios={{
								name: 'chevron.up',
								size: 16
							}}
							android={{
								name: 'keyboard_arrow_up',
								size: 20
							}}
							web={{
								name: 'ChevronUp',
								size: 18
							}}
							style={styles.arrowIcon}
						/>
					</Pressable>

					{/* Move Down Button */}
					<Pressable
						onPress={onMoveDown}
						disabled={isLastItem}
						style={({ pressed }) => [
							styles.arrowButton,
							{
								opacity: isLastItem ? 0.3 : pressed ? 0.7 : 1
							}
						]}
						accessibilityLabel="Move down"
					>
						<PlatformIcon
							ios={{
								name: 'chevron.down',
								size: 16
							}}
							android={{
								name: 'keyboard_arrow_down',
								size: 20
							}}
							web={{
								name: 'ChevronDown',
								size: 18
							}}
							style={styles.arrowIcon}
						/>
					</Pressable>

					{/* Delete Button or empty spacer for alignment */}
					<View style={styles.deleteButtonContainer}>
						{item.removable ? (
							<Pressable
								onPress={onPressDelete}
								style={({ pressed }) => [
									styles.deleteButton,
									{
										opacity: pressed ? 0.5 : 1
									}
								]}
								hitSlop={{
									top: 13,
									right: 15,
									bottom: 13,
									left: 15
								}}
								accessibilityLabel="Remove item"
							>
								<PlatformIcon
									ios={{
										name: 'minus.circle',
										size: 20
									}}
									android={{
										name: 'do_not_disturb_on',
										variant: 'outlined',
										size: 24
									}}
									web={{
										name: 'CircleMinus',
										size: 24
									}}
									style={styles.minusIcon}
								/>
							</Pressable>
						) : null}
					</View>
				</View>
			</View>
		</View>
	)
}

const stylesheet = createStyleSheet((theme) => ({
	row: {
		alignItems: 'center',
		backgroundColor: theme.colors.card,
		flexDirection: 'row',
		gap: 14,
		justifyContent: 'center',
		minHeight: 48,
		paddingHorizontal: 16
	},
	outerRow: {
		borderColor: theme.colors.border
	},
	text: {
		color: theme.colors.text,
		flexGrow: 1,
		flexShrink: 1,
		fontSize: 16
	},
	minusIcon: {
		color: theme.colors.labelSecondaryColor
	},
	actionButtons: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	arrowButton: {
		padding: 8,
		marginHorizontal: 2,
		justifyContent: 'center',
		alignItems: 'center'
	},
	arrowIcon: {
		color: theme.colors.text
	},
	iconContainer: {
		width: 24,
		alignItems: 'center',
		justifyContent: 'center'
	},
	deleteButtonContainer: {
		width: 24,
		marginLeft: 8,
		alignItems: 'center',
		justifyContent: 'center'
	},
	deleteButton: {
		justifyContent: 'center',
		alignItems: 'center'
	}
}))
