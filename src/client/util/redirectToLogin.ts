import { useEffect } from 'react'

export const isUnauthorizedResponse = (value: unknown): value is { message: string } => {
  return typeof value === 'object' && value !== null && 'message' in value && value.message === 'Unauthorized'
}

export type LoginFailure = 'expired' | 'failed'

export const loginFailureFromUrl = (): LoginFailure | null => {
  const value = new URLSearchParams(window.location.search).get('login')
  return value === 'expired' || value === 'failed' ? value : null
}

export const redirectToLogin = () => {
  window.location.replace('/api/login')
}

export const RedirectToLogin = () => {
  useEffect(() => {
    redirectToLogin()
  }, [])

  return null
}
