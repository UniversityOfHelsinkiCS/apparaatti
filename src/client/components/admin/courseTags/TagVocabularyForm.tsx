import { Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

interface TagVocabularyFormProps {
  isEditable: boolean
  onCreate: (key: string, description: string | null) => Promise<boolean>
}

const TagVocabularyForm = ({ isEditable, onCreate }: TagVocabularyFormProps) => {
  const { t } = useTranslation()
  const [newKey, setNewKey] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const handleCreate = async () => {
    const created = await onCreate(newKey, newDescription || null)
    if (!created) return

    setNewKey('')
    setNewDescription('')
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <TextField
        size="small"
        label={t('v2:courseTags.vocabulary.key')}
        value={newKey}
        onChange={event => setNewKey(event.target.value)}
      />
      <TextField
        size="small"
        fullWidth
        label={t('v2:courseTags.vocabulary.description')}
        value={newDescription}
        onChange={event => setNewDescription(event.target.value)}
      />
      <BlackOutlinedButton type="button" onClick={handleCreate} disabled={!isEditable || newKey.trim().length === 0}>
        {t('v2:courseTags.vocabulary.add')}
      </BlackOutlinedButton>
    </Stack>
  )
}

export default TagVocabularyForm
