import { type SelectChangeEvent, type SxProps } from '@mui/material'
import { useContext } from 'react'

import { LanguageContext } from '../contexts/languageContext'
import { HyMenuItem, HySelect } from './common/hy/HySelect'

const LanguageSelector = ({ sx }: { sx?: SxProps }) => {
  const { language, setAppLanguage } = useContext(LanguageContext)

  const handleChange = (event: SelectChangeEvent) => {
    setAppLanguage(event.target.value)
  }

  return (
    <HySelect
      value={language}
      onChange={handleChange}
      aria-label="Language selector"
      data-testid="language-selector"
      sx={sx}
    >
      <HyMenuItem value="fi">Suomi</HyMenuItem>
      <HyMenuItem value="en">English</HyMenuItem>
      <HyMenuItem value="sv">Svenska</HyMenuItem>
    </HySelect>
  )
}

export default LanguageSelector
