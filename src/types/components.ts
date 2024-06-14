import { type MaterialCommunityIcons } from '@expo/vector-icons'
import { type ColorValue } from 'react-native'

import { type MaterialIcon } from './material-icons'

export interface SectionGroup {
    title?: string
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
    fontWeight?:
        | 'normal'
        | 'bold'
        | '100'
        | '200'
        | '300'
        | '400'
        | '500'
        | '600'
        | '700'
        | '800'
        | '900'
        | undefined
}

export interface FormListSections {
    header: string
    footer?: string
    items: SectionGroup[]
}
