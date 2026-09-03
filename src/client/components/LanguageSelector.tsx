import { type SelectChangeEvent, type SxProps } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageContext } from '../contexts/languageContext'
import { HyMenuItem, HySelect } from './common/hy/HySelect'

export const LANGUAGES = [
  { code: 'fi', name: 'Suomi' },
  { code: 'en', name: 'English' },
  { code: 'sv', name: 'Svenska' },
]

const LanguageSelector = ({ sx }: { sx?: SxProps }) => {
  const { language, setAppLanguage } = useContext(LanguageContext)
  const { t } = useTranslation()

  const handleChange = (event: SelectChangeEvent) => {
    setAppLanguage(event.target.value)
  }

  return (
    <HySelect
      value={language}
      onChange={handleChange}
      inputProps={{ 'aria-label': t('v2:languageSelector') }}
      data-testid="language-selector"
      sx={sx}
    >
      {LANGUAGES.map(({ code, name }) => (
        <HyMenuItem key={code} value={code} lang={code}>
          {name}
        </HyMenuItem>
      ))}
    </HySelect>
  )
}

export default LanguageSelector
