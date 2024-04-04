import { type MaterialCommunityIcons } from '@expo/vector-icons'
import { type ColorValue } from 'react-native'

import { type MaterialIcon } from './material-icons'

export interface SectionGroup {
    title: string
    value?: string
    icon?: {
        ios: string
        android: MaterialIcon | typeof MaterialCommunityIcons.defaultProps.name
        iosFallback?: boolean
    }
    disabled?: boolean
    onPress?: () => Promise<void> | void
    iconColor?: ColorValue
    layout?: 'row' | 'column'
}

export interface FormListSections {
    header: string
    footer?: string
    items: SectionGroup[]
}
