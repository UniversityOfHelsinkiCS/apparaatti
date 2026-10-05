import { Stack, TextField } from '@mui/material'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SnapshotMetaFieldsProps {
  initialName: string
  onChange: (meta: { name: string; description: string }) => void
}

const SnapshotMetaFields = ({ initialName, onChange }: SnapshotMetaFieldsProps) => {
  const { t } = useTranslation()
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState('')

  const handleNameChange = (value: string) => {
    setName(value)
    onChange({ name: value, description })
  }

  const handleDescriptionChange = (value: string) => {
    setDescription(value)
    onChange({ name, description: value })
  }

  return (
    <Stack spacing={2}>
      <TextField
        size="small"
        fullWidth
        label={t('v2:courseTags.publish.nameLabel')}
        helperText={t('v2:courseTags.publish.nameHelp')}
        value={name}
        onChange={event => handleNameChange(event.target.value)}
      />
      <TextField
        size="small"
        fullWidth
        label={t('v2:courseTags.publish.descriptionLabel')}
        helperText={t('v2:courseTags.publish.descriptionHelp')}
        value={description}
        onChange={event => handleDescriptionChange(event.target.value)}
      />
    </Stack>
  )
}

export default memo(SnapshotMetaFields)
