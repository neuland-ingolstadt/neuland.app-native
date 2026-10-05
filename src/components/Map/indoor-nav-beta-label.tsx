import type React from 'react'
import { Text, View } from 'react-native'

interface IndoorNavBetaLabelProps {
	label: string
}

/** Compact pill for the indoor-nav start row in the room detail sheet. */
export function IndoorNavBetaLabel({
	label
}: IndoorNavBetaLabelProps): React.JSX.Element {
	return (
		<View className="rounded-full border-hairline border-primary/35 bg-primary/12 px-2.5 py-1">
			<Text
				className="text-[11px] font-bold uppercase text-primary ios:tracking-[0.22em] android:tracking-widest web:tracking-[0.22em]"
				accessibilityElementsHidden
				importantForAccessibility="no-hide-descendants"
			>
				{label}
			</Text>
		</View>
	)
}
