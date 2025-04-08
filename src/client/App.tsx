import MultiChoiceForm from './components/MultiChoiceForm.tsx';
import { useQuery } from '@tanstack/react-query';
import { Form } from '../common/types.ts';

function App() {
  const { data: form, isLoading } = useQuery<Form>({
    queryKey: ['form'],
    queryFn: async () => {
      const res = await fetch('/api/form/1')
      return res.json()
    },
  })

  if (isLoading || !form) {
    return <div>Loading...</div>
  }

  return (
    <>
      <MultiChoiceForm form={form}/>
    </>
  )
}

export default App
