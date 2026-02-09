import { Select, MenuItem, SelectChangeEvent } from '@mui/material'
import { useContext } from 'react'
import { LanguageContext } from '../../contexts/languageContext'

const LanguageSelector = () => {
  const { language, setAppLanguage } = useContext(LanguageContext)

  const handleChange = (event: SelectChangeEvent) => {
    setAppLanguage(event.target.value)
  }

  return (
    <Select
      value={language}
      onChange={handleChange}
      size="small"
      sx={{
        color: 'inherit',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.23)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0, 0, 0, 0.87)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'primary.main',
        },
        minWidth: 80,
      }}
    >
      <MenuItem value="fi">Suomi</MenuItem>
      <MenuItem value="en">English</MenuItem>
      <MenuItem value="sv">Svenska</MenuItem>
    </Select>
  )
}

export default LanguageSelector
