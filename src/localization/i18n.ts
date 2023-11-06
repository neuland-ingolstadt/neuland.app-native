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
    lng: 'de',

    compatibilityJSON: 'v3',
    resources,
    debug: true,

    interpolation: {
        escapeValue: false,
    },
})
export default i18n
