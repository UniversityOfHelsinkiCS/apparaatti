import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { useContext } from 'react'
import { LanguageContext } from '../contexts/languageContext'

const LanguageSelect = () => {
  const languageContext = useContext(LanguageContext)
  const handleChange = (e: SelectChangeEvent) => {
    e.preventDefault()
    languageContext?.setAppLanguage(e.target.value)
  }
  return (
    <FormControl fullWidth>
      <InputLabel>Language</InputLabel>
      <Select value= {languageContext?.language} onChange={handleChange}>
        <MenuItem value={'fi'}>Fi</MenuItem>
        <MenuItem value={'sv'}>Sve</MenuItem>
        <MenuItem value={'en'}>En</MenuItem>
      </Select>
    </FormControl>
  )
}

export default LanguageSelect

