import MultiChoiceForm from './components/MultiChoiceForm.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Form } from '../common/types.ts';
import { AnswerSchema } from '../common/validators.ts';

function App() {
  const { data: form, isLoading } = useQuery<Form>({
    queryKey: ['form'],
    queryFn: async () => {
      const res = await fetch('/api/form/1')
      return res.json()
    },
  })

  const submitAnswerMutation = useMutation({
    mutationFn: async (formData: FormData) => {

      const answerData = AnswerSchema.parse(Object.fromEntries(formData))

      const res = await fetch('/api/form/1/answer', {
        method: 'POST',
        body: JSON.stringify(answerData),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error('Network response was not ok')
      }
    },
  })

  const handleSubmit = async (formData: FormData) => {

    submitAnswerMutation.mutateAsync(formData, {
      onSuccess: () => {
        console.log('Form submitted successfully')
      }
    })
  }

  if (isLoading || !form) {
    return <div>Loading...</div>
  }

  return (
    <>
      <MultiChoiceForm form={form} onSubmit={handleSubmit}/>
    </>
  )
}

export default App
