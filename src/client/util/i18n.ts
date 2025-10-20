import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '../locales/en.ts'
import fi from '../locales/fi.ts'
import sv from '../locales/sv.ts'
import { LocalizedString } from '../../common/types'

declare global {
  interface Window {
    __i18n__: typeof i18n
  }
}

export function translateLocalizedString(text: LocalizedString): string{
  const currentLanguage = i18n.language
  const keys = Object.keys(text)
  if(keys.includes(currentLanguage)){
    return text[currentLanguage]
  }
  //sometimes sisu course does not have an english/svedish translation so checking both and preferring english
  const englishFallBack:string | undefined = text['en']
  const finnishFallBack:string | undefined = text['fi']
  
  return englishFallBack != undefined ? englishFallBack : finnishFallBack
}

const initializeI18n = () =>
  i18n.use(initReactI18next).init({
    resources: {
      en,
      fi,
      sv,
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
  })

window.__i18n__ = i18n

export default initializeI18n
