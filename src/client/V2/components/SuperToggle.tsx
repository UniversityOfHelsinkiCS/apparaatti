import React from 'react'
import { FormControlLabel, Switch } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useFilterContext } from '../filterContext'

const SuperToggle = ({ filterId }: { filterId: string }) => {
  const { t } = useTranslation()
  const { strictFilters, setStrictFilters } = useFilterContext()

  const isStrict = strictFilters.includes(filterId)

  const handleToggle = () => {
    if (isStrict) {
      setStrictFilters(strictFilters.filter((id) => id !== filterId))
    } else {
      setStrictFilters([...strictFilters, filterId])
    }
  }

  return (
    <FormControlLabel
      control={<Switch checked={isStrict} onChange={handleToggle} />}
      label={t('form:strictFilter')}
    />
  )
}

export default SuperToggle
