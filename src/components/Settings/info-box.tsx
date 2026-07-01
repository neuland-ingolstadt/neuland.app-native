import { Link, type RelativePathString } from 'expo-router'
import type React from 'react'
import { Platform, Pressable, Text, View, type ViewStyle } from 'react-native'
import { useCSSVariable } from 'uniwind'
import PlatformIcon, { type LucideIcon } from '@/components/Universal/icon'
import type { MaterialIcon } from '@/types/material-icons'
import { hairlineBorder, toColor } from '@/utils/uniwind-utils'

interface InfoBoxProps {
	title: string
	value: string
	icon: {
		ios: string
		android: MaterialIcon
		web: LucideIcon
		variant?: 'fill' | 'outline'
	}
	style?: ViewStyle
	href: RelativePathString
	isExternalLink?: boolean
}

const InfoBox = ({
	title,
	value,
	icon,
	href,
	style,
	isExternalLink
}: InfoBoxProps): React.JSX.Element => {
	const textColor = toColor(useCSSVariable('--color-text'))
	const labelColor = toColor(useCSSVariable('--color-label'))

	return (
		<Link href={href} asChild>
			<Pressable
				className="items-center bg-card border-border rounded-md ios:rounded-ios flex-1 justify-center p-4 min-h-20 active:opacity-90"
				style={[hairlineBorder, style]}
			>
				<View className="items-center justify-center mb-2">
					<PlatformIcon
						ios={{
							name: icon.ios,
							size: 19,
							variant: icon.variant
						}}
						android={{
							name: icon.android,
							size: 24
						}}
						web={{
							name: icon.web,
							size: 21
						}}
						style={{
							color: textColor,
							marginBottom: Platform.OS === 'android' ? -4 : 2
						}}
					/>
				</View>
				<Text className="text-text text-[17px] font-bold">{value}</Text>
				<Text className="text-label text-[13px] mt-1">
					{title}
					{isExternalLink && Platform.OS !== 'android' && (
						<>
							<Text> </Text>
							<PlatformIcon
								ios={{ name: 'arrow.up.right', size: 5 }}
								android={{ name: 'search', size: 14 }}
								web={{ name: 'ArrowUpRight', size: 14 }}
								style={{
									color: labelColor,
									marginBottom: Platform.OS === 'ios' ? -1 : -3
								}}
							/>
						</>
					)}
				</Text>
			</Pressable>
		</Link>
	)
}

export default InfoBox
