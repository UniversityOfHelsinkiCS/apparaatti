import { StrictMode, useContext } from 'react'
import { createRoot } from 'react-dom/client'

import { defineCustomElements } from '@uh-design-system/component-library/loader'
import '@uh-design-system/component-library/dist/component-library/component-library.css'
import '@uh-design-system/component-library/dist/fonts/fonts.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { LanguageContext, LanguageContextProvider } from './contexts/languageContext.tsx'
import initializeI18n from './util/i18n.ts'
import AppRouter from './router.tsx'

defineCustomElements()

const queryClient = new QueryClient()
const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: '#f5f5f5',
    },
    text: {
      primary: '#000000',
    },
  },
})

// Keeps <ds-store> language in sync with the app's i18n language.
// Must be rendered inside LanguageContextProvider.
const DsStoreSync = () => {
  const { language } = useContext(LanguageContext)
  const supportedLangs = ['fi', 'sv', 'en']
  const dsLang = supportedLangs.includes(language) ? language : 'en'
  return <ds-store ds-language={dsLang} />
}

initializeI18n()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageContextProvider>
          <DsStoreSync />
          <AppRouter />
        </LanguageContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
