import { useQuery } from '@tanstack/react-query'

export const generateSettings = (method: string, jsonBody?: any) => {
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

  return settings
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
      const settings = generateSettings(method, jsonBody)
      const res = await fetch(endPoint, settings)
      return res.json() as Promise<T>
    },
  })

  return { data, isLoading, refetch }
}

export default useApi
