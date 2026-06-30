import type React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Pressable, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'
import PlatformIcon from '../Universal/icon'

interface HeaderRightProps {
	setToday: () => void
	onPressPreferences: () => void
	onPressPrevious?: () => void
	onPressNext?: () => void
}

export function HeaderRight({
	setToday,
	onPressPreferences,
	onPressPrevious,
	onPressNext
}: HeaderRightProps): React.JSX.Element {
	const { t } = useTranslation(['accessibility'])
	const textColor = toColor(useCSSVariable('--color-text'))

	return (
		<View
			className={`flex-row ${Platform.OS !== 'ios' ? 'gap-2.5 mx-1.5' : 'gap-5 mx-[3px]'}`}
		>
			<Pressable
				onPress={setToday}
				hitSlop={10}
				accessibilityLabel={t('button.timetableBack')}
			>
				<PlatformIcon
					ios={{
						name: 'arrow.uturn.left',
						size: 20
					}}
					android={{
						name: 'calendar_today',
						size: 24
					}}
					web={{
						name: 'Undo2',
						size: 24
					}}
					style={{ color: textColor }}
				/>
			</Pressable>
			{Platform.OS === 'web' && onPressPrevious && onPressNext && (
				<View className="ml-2 gap-2 flex-row">
					<Pressable
						onPress={onPressPrevious}
						hitSlop={10}
						accessibilityLabel={t('button.previous')}
					>
						<PlatformIcon
							ios={{ name: 'chevron-left', size: 20 }}
							android={{ name: 'chevron_right', size: 24 }}
							web={{ name: 'ChevronLeft', size: 24 }}
							style={{ color: textColor }}
						/>
					</Pressable>
					<Pressable
						onPress={onPressNext}
						hitSlop={10}
						accessibilityLabel={t('button.next')}
					>
						<PlatformIcon
							ios={{ name: 'chevron-right', size: 20 }}
							android={{ name: 'chevron_right', size: 24 }}
							web={{ name: 'ChevronRight', size: 24 }}
							style={{ color: textColor }}
						/>
					</Pressable>
				</View>
			)}
			<Pressable onPress={onPressPreferences} className="flex-row" hitSlop={10}>
				<PlatformIcon
					ios={{ name: 'gear', size: 20 }}
					android={{ name: 'settings', size: 24, variant: 'filled' }}
					web={{ name: 'Settings', size: 24 }}
					style={{ color: textColor }}
				/>
			</Pressable>
		</View>
	)
}
