import { useMutation } from '@tanstack/react-query'
import { generateSettings } from '../util/useApi'



const useApiMutation = (mutationFn, endpoint) => {

  const mutation = useMutation({
    mutationFn: async (data) => {
     
      console.log('data is ', data)
      const settings = generateSettings('POST', data)
      console.log('settings', settings)
      const res = await fetch(endpoint, settings)
      await mutationFn(res)
    },
  })

  const mutateAsync = (data, settings) => {
    return mutation.mutateAsync(data, settings)
  }

  
  return {mutateAsync}
}



export default useApiMutation
