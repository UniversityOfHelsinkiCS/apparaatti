import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MultiChoiceForm from './components/MultiChoiceForm.tsx';
import { useQuery } from '@tanstack/react-query';
import { Form } from '../common/types.ts';




function App() {
 

  async function callHome(){
    const req = await fetch('/api')
    const answer = await req.text()
    console.log(answer)
    return answer
  }


  const { form, isLoading, error } = useQuery({
    queryKey: ['form'],
    queryFn: () => {
      return fetch('/api/form/1')
        .then((res) => res.json())
        .then((data) => {
          console.log(data)
          return data as Form
        })
    },
  })

  useEffect(() => {
    callHome()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
     
      <MultiChoiceForm form={form}/>
   
    </>
  )
}

export default App
