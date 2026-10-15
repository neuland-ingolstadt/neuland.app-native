import { getLocales } from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { defaultNS, resources } from '@/localization/resources'

export {
	defaultNS,
	type LanguageKey,
	resources
} from '@/localization/resources'

const locales = getLocales()
const languageCode =
	(locales && locales.length > 0 ? locales[0].languageCode : '') ?? ''
const fallbackLanguage = defaultNS
const language = Object.keys(resources).includes(languageCode)
	? languageCode
	: fallbackLanguage

void i18n.use(initReactI18next).init({
	fallbackLng: fallbackLanguage,
	lng: language,
	compatibilityJSON: 'v4',
	interpolation: {
		escapeValue: false
	},
	resources
})
export default i18n
