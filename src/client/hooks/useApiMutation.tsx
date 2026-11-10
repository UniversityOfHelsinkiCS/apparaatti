import { type MutateOptions, useMutation } from '@tanstack/react-query'

import { apiFetch } from '../util/useApi'

const useApiMutation = <TData = unknown,>(mutationFn: (res: Response) => Promise<void>, endpoint: string) => {
  const mutation = useMutation({
    mutationFn: async (data: TData) => {
      const res = await apiFetch(endpoint, 'POST', data)
      await mutationFn(res)
    },
  })

  const mutateAsync = (data: TData, settings?: MutateOptions<void, Error, TData>) => {
    return mutation.mutateAsync(data, settings)
  }

  return { mutateAsync }
}

export default useApiMutation
