import { getLocales } from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import de from './de'
import en from './en'

const resources = {
    en,
    de,
}

void i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    lng: getLocales()[0].languageCode,

    compatibilityJSON: 'v3',
    resources,
    debug: false,

    interpolation: {
        escapeValue: false,
    },
})
export default i18n
