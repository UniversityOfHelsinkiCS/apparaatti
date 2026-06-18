import { MenuItem, Select, SelectChangeEvent, SxProps } from '@mui/material'
import { useContext } from 'react'

import { LanguageContext } from '../contexts/languageContext'
import { mergeSx } from '../util/sx'

const LanguageSelector = ({ sx }: { sx?: SxProps }) => {
  const { language, setAppLanguage } = useContext(LanguageContext)

  const handleChange = (event: SelectChangeEvent) => {
    setAppLanguage(event.target.value)
  }

  return (
    <Select
      value={language}
      onChange={handleChange}
      aria-label="Language selector"
      size="small"
      sx={mergeSx(
        {
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
        },
        sx
      )}
    >
      <MenuItem value="fi">Suomi</MenuItem>
      <MenuItem value="en">English</MenuItem>
      <MenuItem value="sv">Svenska</MenuItem>
    </Select>
  )
}

export default LanguageSelector
