import type { User } from '../../common/types'
import useApi from './useApi'
import { isUnauthorizedResponse } from './redirectToLogin'

type RequiredUserResult = {
  user: User | null
  isLoading: boolean
  isUnauthorized: boolean
}

const useRequiredUser = (): RequiredUserResult => {
  const { data, isLoading } = useApi<User>('user', '/api/user', 'GET')

  if (isLoading || isUnauthorizedResponse(data)) {
    return {
      user: null,
      isLoading,
      isUnauthorized: isUnauthorizedResponse(data),
    }
  }

  return {
    user: data ?? null,
    isLoading: false,
    isUnauthorized: false,
  }
}

export default useRequiredUser
