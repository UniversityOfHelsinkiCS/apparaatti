import { createContext, useState } from 'react'

interface LanguageContextType {
  language: string
  setDefaultLanguage: (lang: string) => void,
  setAppLanguage: (lang: string) => void
}
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)





export const LanguageContextProvider = ({ children }: { children: React.ReactNode }) => {
  const supportedLangs: string[] = ['fi', 'sv', 'en']
  const [language, setLanguage] = useState('')

  //Sets language to the wanted value if it is supported and there is no language set yet
  const setDefaultLanguage = (lang: string) => {
    if(language === ''){
      setAppLanguage(lang)
    }
    else{
      console.log('language is already set once')
    }
  }  

  //changes the language if the language is valid
  const setAppLanguage = (lang: string)=> {
    if(supportedLangs.includes(lang)){
      setLanguage(lang)
    }
    else{ 
      console.log('language not supported', lang)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setDefaultLanguage, setAppLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
