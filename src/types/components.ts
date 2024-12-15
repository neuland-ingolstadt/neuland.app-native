import {
    type CommunityIcon,
    type LucideIcon,
} from '@/components/Universal/Icon'
import { type ColorValue } from 'react-native'

import { type MaterialIcon } from './material-icons'

export interface SectionGroup {
    title?: string
    value?: string
    icon?: {
        ios: string
        android: MaterialIcon | CommunityIcon
        web: LucideIcon
        iosFallback?: boolean
        androidVariant?: 'outlined' | 'filled'
    }
    disabled?: boolean
    onPress?: () => Promise<void> | void
    iconColor?: ColorValue
    textColor?: ColorValue
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
    selectable?: boolean
}

export interface FormListSections {
    header?: string
    footer?: string
    items?: SectionGroup[]
    item?: string
}
