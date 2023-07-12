export interface SectionGroup {
    title: string
    value?: string
    icon?: string
    disabled?: boolean
    onPress?: () => Promise<void> | void
}

export interface FormListSections {
    header: string
    items: SectionGroup[]
}
