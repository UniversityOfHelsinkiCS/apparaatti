import * as Sentry from '@sentry/react'
import { useQuery } from '@tanstack/react-query'
import { createContext, type ReactNode, useContext } from 'react'

import type { BackendLocaleContext as BackendLocaleContextValues, ResolvedBackendLocales } from '../../common/types'
import AppMarkdown from '../components/common/AppMarkdown'
import { translateLocalizedString } from '../util/i18n'
import { generateSettings } from '../util/useApi'
import { useFilterContext } from './filterContext'

type BackendLocaleContextType = {
  renderLocale: (key: string) => ReactNode
  localeText: (key: string) => string | null
}

const BackendLocaleContext = createContext<BackendLocaleContextType | undefined>(undefined)

const reportedErrors = new Set<string>()

const errorMessage = (kind: 'unknown-key' | 'no-match', key: string, context: BackendLocaleContextValues) => {
  if (kind === 'unknown-key') {
    return `Backend locale key "${key}" does not exist. Create it at /admin/backend-locales.`
  }
  const dimensions = `organisation=${context.organisationCode}, lang=${context.lang}, primaryLanguage=${context.primaryLanguage}, primaryLanguageSpecification=${context.primaryLanguageSpecification}`
  return `Backend locale key "${key}" has no text matching ${dimensions}. Add a catch-all text (all dimensions "any") at /admin/backend-locales.`
}

const reportBackendLocaleError = (
  kind: 'unknown-key' | 'no-match',
  key: string,
  context: BackendLocaleContextValues
) => {
  const deduplicationKey = `${kind}|${key}|${JSON.stringify(context)}`
  if (reportedErrors.has(deduplicationKey)) return

  reportedErrors.add(deduplicationKey)
  const message = errorMessage(kind, key, context)
  console.error(message)
  Sentry.captureMessage(message, 'warning')
}

export const BackendLocaleProvider = ({ children }: { children: ReactNode }) => {
  const { studyField, language, primaryLanguage, primaryLanguageSpecification } = useFilterContext()

  const usePrimaryLanguageSpecification = language !== '' && language !== 'en' && language === primaryLanguage

  const context: BackendLocaleContextValues = {
    organisationCode: studyField,
    lang: language,
    primaryLanguage,
    primaryLanguageSpecification: usePrimaryLanguageSpecification ? primaryLanguageSpecification : '',
  }

  const search = new URLSearchParams()
  if (context.organisationCode) search.set('organisation', context.organisationCode)
  if (context.lang) search.set('lang', context.lang)
  if (context.primaryLanguage) search.set('primaryLanguage', context.primaryLanguage)
  if (context.primaryLanguageSpecification) {
    search.set('primaryLanguageSpecification', context.primaryLanguageSpecification)
  }
  const queryString = search.toString()

  const { data } = useQuery<{ locales: ResolvedBackendLocales }>({
    queryKey: ['backendLocales', queryString],
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async () => {
      const res = await fetch(`/api/backend-locales?${queryString}`, generateSettings('GET'))
      if (!res.ok) return { locales: {} }
      return res.json()
    },
  })

  const localeText = (key: string) => {
    const locales = data?.locales
    if (!locales) return null

    if (!(key in locales)) {
      reportBackendLocaleError('unknown-key', key, context)
      return null
    }

    const text = locales[key]
    if (!text) {
      reportBackendLocaleError('no-match', key, context)
      return null
    }

    return translateLocalizedString(text)
  }

  const renderLocale = (key: string) => {
    const text = localeText(key)
    if (!text) return null
    return <AppMarkdown>{text}</AppMarkdown>
  }

  return <BackendLocaleContext.Provider value={{ renderLocale, localeText }}>{children}</BackendLocaleContext.Provider>
}

export const useBackendLocales = () => {
  const context = useContext(BackendLocaleContext)
  if (context === undefined) {
    throw new Error('useBackendLocales must be used within a BackendLocaleProvider')
  }
  return context
}
