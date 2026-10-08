import type React from 'react'
import { Pressable, Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon from '@/components/Universal/icon'
import { toColor } from '@/utils/uniwind-utils'

interface MapChevronLinkProps {
	label: string
	testID: string
	onPress: () => void
	wrapperClassName?: string
}

/** Shared chevron link row — room report, OSM attribution. */
export function MapChevronLink({
	label,
	testID,
	onPress,
	wrapperClassName = 'py-2.5'
}: MapChevronLinkProps): React.JSX.Element {
	const labelColor = toColor(useCSSVariable('--color-label'))
	return (
		<View className={wrapperClassName}>
			<Pressable
				testID={testID}
				onPress={onPress}
				className="items-center flex-row gap-1"
			>
				<Text className="text-[15px] ps-1" style={{ color: labelColor }}>
					{label}
				</Text>
				<PlatformIcon
					style={{ color: labelColor }}
					ios={{ name: 'chevron.forward', size: 6 }}
					android={{ name: 'chevron_right', size: 16 }}
					web={{ name: 'ChevronRight', size: 16 }}
				/>
			</Pressable>
		</View>
	)
}
