import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { LanguageContextProvider } from './contexts/languageContext.tsx'
import initializeI18n from './util/i18n.ts'
import AppRouter from './router.tsx'

// hy-design-system stuff
import '@uh-design-system/component-library/dist/component-library/component-library.css'
import '@uh-design-system/component-library/dist/fonts/fonts.css'
import './assets/ds-overrides.css'
import { defineCustomElements } from '@uh-design-system/component-library/loader'
defineCustomElements()

const queryClient = new QueryClient()

const theme = createTheme({
  typography: {
    fontFamily: "'Open Sans Variable', 'Open Sans', sans-serif",
  },
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
