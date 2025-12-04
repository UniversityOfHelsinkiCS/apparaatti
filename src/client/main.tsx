import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { LanguageContextProvider } from './contexts/languageContext.tsx'
import initializeI18n from './util/i18n.ts'
import { FormContextProvider } from './contexts/formContext.tsx'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import AdminPage from './components/AdminPage.tsx'
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
initializeI18n()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageContextProvider>
          <FormContextProvider>
            <Router>
              <Routes>
                <Route path="/" element={<App />}/>
                <Route path="/admin" element={<AdminPage/>}/>
              </Routes>
            </Router>
          </FormContextProvider>
        </LanguageContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
