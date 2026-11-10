import { Stack, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface FilterVersionMetaFieldsProps {
  initialName: string
  initialDescription?: string
  onChange: (meta: { name: string; description: string }) => void
}

const FilterVersionMetaFields = ({ initialName, initialDescription = '', onChange }: FilterVersionMetaFieldsProps) => {
  const { t } = useTranslation()
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)

  useEffect(() => {
    onChange({ name, description })
  }, [name, description, onChange])

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <TextField
        size="small"
        label={t('v2:filterVersions.meta.name')}
        value={name}
        onChange={event => setName(event.target.value)}
      />
      <TextField
        size="small"
        multiline
        minRows={2}
        label={t('v2:filterVersions.meta.description')}
        value={description}
        onChange={event => setDescription(event.target.value)}
      />
    </Stack>
  )
}

export default FilterVersionMetaFields
