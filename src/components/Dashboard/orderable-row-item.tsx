import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Platform, Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import type { ExtendedCard } from '@/components/all-cards'
import { cardIcons } from '@/components/icons'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'

const { width } = Dimensions.get('window')

interface OrderableRowItemProps {
	item: ExtendedCard
	index: number
	isLast: boolean
	onMoveUp: () => void
	onMoveDown: () => void
	isFirstItem: boolean
	isLastItem: boolean
	drag?: () => void
	isActive?: boolean
}

export default function OrderableRowItem({
	item,
	isLast,
	onMoveUp,
	onMoveDown,
	isFirstItem,
	isLastItem,
	drag,
	isActive
}: OrderableRowItemProps): React.JSX.Element {
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelSecondaryColor = toColor(useCSSVariable('--color-label-secondary'))
	const bottomWidth = isLast ? 0 : 1
	const isWeb = Platform.OS === 'web'
	const { t } = useTranslation(['accessibility'])

	return (
		<View>
			<Pressable
				onLongPress={drag}
				className="items-center bg-card flex-row gap-3.5 justify-center min-h-[50px] px-4 border-border"
				style={{
					width: width - 24,
					borderBottomWidth: bottomWidth,
					opacity: isActive ? 0.8 : 1
				}}
			>
				<View className="w-6 items-center justify-center">
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
						style={{ color: textColor }}
					/>
				</View>

				<Text className="text-text grow shrink text-base">{item.text}</Text>

				{isWeb ? (
					<View className="flex-row items-center">
						<Pressable
							onPress={onMoveUp}
							disabled={isFirstItem}
							className="p-2 mx-0.5 justify-center items-center"
							style={{ opacity: isFirstItem ? 0.3 : 1 }}
							accessibilityLabel={t('dashboard.moveUp')}
						>
							<PlatformIcon
								ios={{ name: 'chevron.up', size: 16 }}
								android={{ name: 'keyboard_arrow_up', size: 20 }}
								web={{ name: 'ChevronUp', size: 18 }}
								style={{ color: textColor }}
							/>
						</Pressable>
						<Pressable
							onPress={onMoveDown}
							disabled={isLastItem}
							className="p-2 mx-0.5 justify-center items-center"
							style={{ opacity: isLastItem ? 0.3 : 1 }}
							accessibilityLabel={t('dashboard.moveDown')}
						>
							<PlatformIcon
								ios={{ name: 'chevron.down', size: 16 }}
								android={{ name: 'keyboard_arrow_down', size: 20 }}
								web={{ name: 'ChevronDown', size: 18 }}
								style={{ color: textColor }}
							/>
						</Pressable>
					</View>
				) : (
					<View className="ml-1">
						<PlatformIcon
							ios={{ name: 'line.3.horizontal', size: 18 }}
							android={{ name: 'drag_handle', size: 22 }}
							web={{ name: 'GripVertical', size: 18 }}
							style={{ color: labelSecondaryColor }}
						/>
					</View>
				)}
			</Pressable>
		</View>
	)
}
