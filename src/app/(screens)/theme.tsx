import MultiSectionRadio from '@/components/Elements/Food/FoodLanguageSection'
import SectionView from '@/components/Elements/Universal/SectionsView'
import { ThemeContext } from '@/components/contexts'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export default function Theme(): JSX.Element {
    const { theme, setTheme } = useContext(ThemeContext)
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
