import '@uh-design-system/component-library/dist/fonts/fonts.css'

import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { LanguageContextProvider } from './contexts/languageContext.tsx'
import AppRouter from './router.tsx'
import theme from './theme'
import initializeI18n from './util/i18n.ts'

const queryClient = new QueryClient()

initializeI18n()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageContextProvider>
          <AppRouter />
        </LanguageContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
