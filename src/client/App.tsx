import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MultiChoiceForm from './components/MultiChoiceForm.tsx';

function App() {
  const [count, setCount] = useState(0)

  async function callHome(){
    const req = await fetch('/api')
    const answer = await req.text()
    console.log(answer)
    return answer
  }


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
