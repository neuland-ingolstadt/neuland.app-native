import type React from 'react'
import { ActivityIndicator, type ViewStyle } from 'react-native'
import { useCSSVariable } from 'uniwind'
import { toColor } from '@/utils/uniwind-utils'

interface LoadingIndicatorProps {
	style?: ViewStyle
}

const LoadingIndicator = ({
	style
}: LoadingIndicatorProps): React.JSX.Element => {
	const primaryColor = toColor(useCSSVariable('--color-primary'))

	return <ActivityIndicator size="small" color={primaryColor} style={style} />
}

export default LoadingIndicator
