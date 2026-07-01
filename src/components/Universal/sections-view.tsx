import type React from 'react'
import { Text, View } from 'react-native'
import { hairlineBorder } from '@/utils/uniwind-utils'

const SectionView = ({
	title,
	footer,
	children,
	link,
	hideBackground = false
}: {
	title?: string
	footer?: string
	children: React.JSX.Element
	link?: { text: string; destination: () => void }
	hideBackground?: boolean
}): React.JSX.Element => {
	return (
		<>
			<View className="self-center mt-4 px-page w-full">
				{title !== '' && title !== undefined && (
					<Text className="text-label-secondary ios:text-base ios:ml-[18px] ios:font-semibold ios:pb-1 android:text-[13px] android:font-normal android:uppercase">
						{title}
					</Text>
				)}
				<View
					className={
						hideBackground
							? 'self-center justify-center mt-0.5 w-full bg-transparent border-transparent'
							: 'self-center bg-card rounded-md ios:rounded-ios border-border justify-center mt-0.5 w-full'
					}
					style={hideBackground ? undefined : hairlineBorder}
				>
					{children}
				</View>
			</View>
			{footer != null && (
				<Text className="mt-1.5 text-xs px-page ios:mx-4 android:mx-0 text-label-secondary">
					{footer}
					{link != null && (
						<Text onPress={link.destination} className="text-primary text-xs">
							{' '}
							{link.text}
						</Text>
					)}
				</Text>
			)}
		</>
	)
}

export default SectionView
