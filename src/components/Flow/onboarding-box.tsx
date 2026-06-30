import type React from 'react'
import { Text, View } from 'react-native'

const OnboardingBox = ({ title }: { title: string }): React.JSX.Element => {
	return (
		<View className="bg-card rounded-md max-w-[600px] p-card">
			<Text className="text-text text-base text-left">{title}</Text>
		</View>
	)
}

export default OnboardingBox
