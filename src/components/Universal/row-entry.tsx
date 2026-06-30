import { Link, type RelativePathString } from 'expo-router'
import type React from 'react'
import { Pressable, Text, View } from 'react-native'
import { hairlineBorder } from '@/utils/uniwind-utils'

const RowEntry = ({
	title,
	leftChildren,
	rightChildren,
	onPress,
	href,
	backgroundColor,
	icon
}: {
	title: string
	leftChildren: React.JSX.Element
	rightChildren: React.JSX.Element
	onPress?: () => void
	href?: RelativePathString
	isExamCard?: boolean
	backgroundColor?: string
	icon?: React.JSX.Element
}): React.JSX.Element => {
	const content = (
		<View
			className="rounded-mg bg-card border-border overflow-hidden px-3.5 py-4 w-full"
			style={[
				hairlineBorder,
				backgroundColor ? { backgroundColor } : undefined
			]}
		>
			<View className="flex-col rounded-md justify-center">
				<View className="flex-row gap-1 pb-1.5">
					{icon}
					<Text
						className="text-text text-base font-semibold"
						numberOfLines={2}
						textBreakStrategy="highQuality"
					>
						{title}
					</Text>
				</View>

				<View className="flex-row justify-between w-full">
					<View className="flex-[2] items-start justify-start">
						{leftChildren}
					</View>
					<View className="flex-1 items-end justify-end">{rightChildren}</View>
				</View>
			</View>
		</View>
	)

	if (!href) {
		return onPress ? (
			<Pressable onPress={onPress} className="active:opacity-90">
				{content}
			</Pressable>
		) : (
			content
		)
	}

	return (
		<Link href={href} asChild>
			<Pressable onPress={onPress} className="active:opacity-90">
				{content}
			</Pressable>
		</Link>
	)
}

export default RowEntry
