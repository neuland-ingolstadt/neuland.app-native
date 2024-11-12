import React from 'react'
import { ActivityIndicator, type ViewStyle } from 'react-native'
import { useStyles } from 'react-native-unistyles'

interface LoadingIndicatorProps {
    style?: ViewStyle
}

const LoadingIndicator = ({ style }: LoadingIndicatorProps): JSX.Element => {
    const { theme } = useStyles()
    return (
        <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={style}
        />
    )
}

export default LoadingIndicator
