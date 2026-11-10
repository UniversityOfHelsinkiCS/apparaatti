import { useQuery } from '@tanstack/react-query'

let cachedCsrfToken: string | null = null

const fetchCsrfToken = async () => {
  if (cachedCsrfToken) return cachedCsrfToken

  const res = await fetch('/api/csrf-token')
  const { csrfToken } = (await res.json()) as { csrfToken: string }
  cachedCsrfToken = csrfToken
  return cachedCsrfToken
}

const isCsrfRejection = (response: Response) => response.status === 403

export const generateSettings = async (method: string, jsonBody?: any) => {
  const settings: Record<string, any> = {}
  settings.method = method
  if (jsonBody) {
    settings.headers = {
      'Content-Type': 'application/json',
    }
    const plain = { ...jsonBody }
    settings.body = JSON.stringify(plain)
  }

  const loginAsUser = localStorage.getItem('loginAsUser')
  const loginAsUserId = loginAsUser ? JSON.parse(loginAsUser).id : ''
  if (loginAsUserId) {
    settings.headers = {
      ...settings.headers,
      'x-login-as': loginAsUserId,
    }
  }

  if (method !== 'GET') {
    settings.headers = {
      ...settings.headers,
      'x-csrf-token': await fetchCsrfToken(),
    }
  }

  return settings
}

export const apiFetch = async (endPoint: string, method: string, jsonBody?: unknown): Promise<Response> => {
  const response = await fetch(endPoint, await generateSettings(method, jsonBody))

  if (method === 'GET' || !isCsrfRejection(response)) {
    return response
  }

  cachedCsrfToken = null
  return await fetch(endPoint, await generateSettings(method, jsonBody))
}

const useApi = <T = unknown,>(
  queryKey: string,
  endPoint: string,
  method: string,
  jsonBody?: Record<string, unknown>
) => {
  const { data, isLoading, refetch } = useQuery<T>({
    queryKey: [queryKey],
    queryFn: async () => {
      const settings = await generateSettings(method, jsonBody)
      const res = await fetch(endPoint, settings)
      return res.json() as Promise<T>
    },
  })

  return { data, isLoading, refetch }
}

export default useApi
