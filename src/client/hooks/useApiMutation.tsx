import { useMutation, type MutateOptions } from '@tanstack/react-query'
import { generateSettings } from '../util/useApi'

const useApiMutation = <TData = unknown,>(mutationFn: (res: Response) => Promise<void>, endpoint: string) => {
  const mutation = useMutation({
    mutationFn: async (data: TData) => {
      const settings = generateSettings('POST', data)
      const res = await fetch(endpoint, settings)
      await mutationFn(res)
    },
  })

  const mutateAsync = (data: TData, settings?: MutateOptions<void, Error, TData>) => {
    return mutation.mutateAsync(data, settings)
  }

  return { mutateAsync }
}

export default useApiMutation
