import { createContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface LanguageContextType {
  language: string
  setDefaultLanguage: (_lang: string) => void,
  setAppLanguage: (_lang: string) => void
}
export const LanguageContext = createContext<LanguageContextType>({
  language: '',
  setDefaultLanguage: (_lang: string) => {},
  setAppLanguage: (_lang: string) => {}
})


function readStorage(key:string): string | null{
  const storageObject = localStorage.getItem(key)
  if(storageObject){
    const value = storageObject
    return value
  }
  return null
}


export const LanguageContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation()
  const supportedLangs: string[] = ['fi', 'sv', 'en']
  useEffect(() => {
    const localLang = readStorage('lang')
    if(localLang){
      i18n.changeLanguage(localLang)
    }
    else{
      i18n.changeLanguage('fi')
    }
  }, [])
  //Sets language to the wanted value if it is supported and there is no language set yet
  const setDefaultLanguage = (lang: string) => {
    const localLang = readStorage('lang')
    if(!localLang){
      setAppLanguage(lang)
    }
  }  

  //changes the language if the language is valid
  const setAppLanguage = (lang: string)=> {
    if(supportedLangs.includes(lang)){
      localStorage.setItem('lang', lang)
      i18n.changeLanguage(lang)
    }
  }

  return (
    <LanguageContext.Provider value={{ language: i18n.language, setDefaultLanguage, setAppLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}
