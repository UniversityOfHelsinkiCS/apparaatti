import React from 'react'
import { FormControlLabel, Switch } from '@mui/material'
import { useFilterContext } from '../filterContext'

const SuperToggle = ({ filterId }: { filterId: string }) => {
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
      label="Super"
    />
  )
}

export default SuperToggle
