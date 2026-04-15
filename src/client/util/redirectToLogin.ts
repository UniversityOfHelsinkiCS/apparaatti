import { useEffect } from 'react'

export const isUnauthorizedResponse = (value: unknown): value is { message: string } => {
  return (
    typeof value === 'object'
    && value !== null
    && 'message' in value
    && value.message === 'Unauthorized'
  )
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