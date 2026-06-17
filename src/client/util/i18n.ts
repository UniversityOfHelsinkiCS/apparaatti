import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { Language, LocalizedString } from '../../common/types'
import en from '../locales/en.ts'
import fi from '../locales/fi.ts'
import sv from '../locales/sv.ts'

const languageKeys: readonly Language[] = ['fi', 'sv', 'en'] as const

function isLanguage(lang: string): lang is Language {
  return languageKeys.some(key => key === lang)
}

declare global {
  interface Window {
    __i18n__: typeof i18n
  }
}

export function translateLocalizedString(text: LocalizedString): string {
  const currentLanguage = i18n.language
  if (isLanguage(currentLanguage) && text[currentLanguage] !== undefined) {
    return text[currentLanguage]
  }
  // sometimes sisu course is missing translations
  return text.en ?? text.fi ?? text.sv ?? ''
}

const initializeI18n = () =>
  i18n.use(initReactI18next).init({
    resources: {
      en,
      fi,
      sv,
    } satisfies Record<Language, any>,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
  })

window.__i18n__ = i18n

export default initializeI18n
