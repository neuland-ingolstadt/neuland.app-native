import { getLocales } from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import de from './de'
import en from './en'

const resources = {
    en,
    de,
}

export type LanguageKey = keyof typeof resources

const languageCode = getLocales()[0].languageCode
const fallbackLanguage = 'en'
const language = Object.keys(resources).includes(languageCode)
    ? languageCode
    : fallbackLanguage

void i18n.use(initReactI18next).init({
    fallbackLng: fallbackLanguage,
    lng: language,
    compatibilityJSON: 'v3',
    resources,
    debug: false,
    interpolation: {
        escapeValue: false,
    },
})
export default i18n
