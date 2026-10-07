import { Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

interface SnapshotCreateFormProps {
  onSave: (name: string, description: string | null) => Promise<void>
}

const SnapshotCreateForm = ({ onSave }: SnapshotCreateFormProps) => {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSave = async () => {
    await onSave(name, description || null)
    setName('')
    setDescription('')
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <TextField
        size="small"
        label={t('v2:courseTags.snapshots.name')}
        value={name}
        onChange={event => setName(event.target.value)}
      />
      <TextField
        size="small"
        fullWidth
        label={t('v2:courseTags.snapshots.description')}
        value={description}
        onChange={event => setDescription(event.target.value)}
      />
      <BlackOutlinedButton type="button" onClick={handleSave} disabled={name.trim().length === 0}>
        {t('v2:courseTags.snapshots.save')}
      </BlackOutlinedButton>
    </Stack>
  )
}

export default SnapshotCreateForm
