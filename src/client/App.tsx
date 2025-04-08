import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MultiChoiceForm from './components/MultiChoiceForm.tsx';
import { useQuery } from '@tanstack/react-query';




function App() {
 

  async function callHome(){
    const req = await fetch('/api')
    const answer = await req.text()
    console.log(answer)
    return answer
  }


  const { data, isLoading, error } = useQuery({
    queryKey: ['form'],
    queryFn: () => {
      return fetch('/api/form/1')
        .then((res) => res.json())
        .then((data) => {
          console.log(data)
          return data
        })
    },
  })

  useEffect(() => {
    callHome()
  }, [])

  return (
    <>
     
      <MultiChoiceForm />
   
    </>
  )
}

export default App
