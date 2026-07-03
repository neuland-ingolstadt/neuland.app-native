import type React from 'react'
import { Text, View } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'
import { toColor } from '@/utils/uniwind-utils'

interface BenefitCardProps {
	title: string
	description: string
	icon: {
		ios: { name: string; size: number }
		android: { name: MaterialIcon; size: number }
		web: { name: LucideIcon; size: number }
	}
}

export function BenefitCard({
	title,
	description,
	icon
}: BenefitCardProps): React.JSX.Element {
	const contrastColor = toColor(useCSSVariable('--color-contrast'))

	return (
		<View className="bg-card rounded-lg p-3 flex-row items-center mb-3">
			<View className="bg-primary w-11 h-11 rounded-full justify-center items-center mr-3">
				<PlatformIcon
					ios={icon.ios}
					android={icon.android}
					web={icon.web}
					style={{ color: contrastColor }}
				/>
			</View>
			<View className="flex-1">
				<Text className="text-text text-base font-bold">{title}</Text>
				<Text className="text-label-secondary text-[13px] mt-0.5">
					{description}
				</Text>
			</View>
		</View>
	)
}
