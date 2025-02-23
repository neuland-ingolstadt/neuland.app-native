import MultiSectionRadio from '@/components/Food/FoodLanguageSection'
import SectionView from '@/components/Universal/SectionsView'
import { usePreferencesStore } from '@/hooks/usePreferencesStore'
import type React from 'react'
import { useTranslation } from 'react-i18next'

export default function Theme(): React.JSX.Element {
    const theme = usePreferencesStore((state) => state.theme)
    const setTheme = usePreferencesStore((state) => state.setTheme)
    const { t } = useTranslation(['settings'])

    const elements = [
        {
            key: 'auto',
            title: t('theme.themes.default'),
        },
        {
            key: 'light',
            title: t('theme.themes.light'),
        },
        {
            key: 'dark',
            title: t('theme.themes.dark'),
        },
    ]

    return (
        <>
            <SectionView
                title={t('theme.themes.title')}
                footer={t('theme.themes.footer')}
            >
                <MultiSectionRadio
                    elements={elements}
                    selectedItem={theme ?? 'auto'}
                    action={setTheme as (item: string) => void}
                />
            </SectionView>
        </>
    )
}
