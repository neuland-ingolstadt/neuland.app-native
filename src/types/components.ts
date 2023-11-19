import { type ColorValue } from 'react-native'

export interface SectionGroup {
    title: string
    value?: string
    icon?: { ios: string; android: string; iosFallback?: boolean }
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
