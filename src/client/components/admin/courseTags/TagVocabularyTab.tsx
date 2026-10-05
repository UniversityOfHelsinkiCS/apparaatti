import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'
import { COURSE_TAGS_PATH } from './courseTagUtils.ts'

interface TagVocabularyTabProps {
  tags: CourseTag[]
  isSuperuser: boolean
}

const TagVocabularyTab = ({ tags, isSuperuser }: TagVocabularyTabProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [newKey, setNewKey] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [error, setError] = useState('')

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['course-tags'] })

  const handleCreate = async () => {
    const response = await adminFetch('POST', COURSE_TAGS_PATH, {
      key: newKey,
      description: newDescription || null,
    })
    if (!response.ok) {
      setError(
        response.status === 409 ? t('v2:courseTags.vocabulary.duplicate') : t('v2:courseTags.vocabulary.invalid')
      )
      return
    }

    setError('')
    setNewKey('')
    setNewDescription('')
    await refresh()
  }

  const handleDescriptionSave = async (tag: CourseTag, description: string) => {
    await adminFetch('PUT', `${COURSE_TAGS_PATH}/${tag.id}`, { key: tag.key, description: description || null })
    await refresh()
  }

  const handleDelete = async (tag: CourseTag) => {
    if (!window.confirm(t('v2:courseTags.vocabulary.deleteConfirm', { key: tag.key }))) return
    await adminFetch('DELETE', `${COURSE_TAGS_PATH}/${tag.id}`)
    await refresh()
  }

  return (
    <Box>
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
        <BlackOutlinedButton type="button" onClick={handleCreate} disabled={newKey.trim().length === 0}>
          {t('v2:courseTags.vocabulary.add')}
        </BlackOutlinedButton>
      </Stack>

      {error ? <Typography color="error">{error}</Typography> : null}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('v2:courseTags.vocabulary.key')}</TableCell>
            <TableCell>{t('v2:courseTags.vocabulary.description')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {tags.map(tag => (
            <TableRow key={tag.id}>
              <TableCell>{tag.key}</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  fullWidth
                  defaultValue={tag.description ?? ''}
                  onBlur={event => handleDescriptionSave(tag, event.target.value)}
                />
              </TableCell>
              <TableCell align="right">
                {isSuperuser ? (
                  <BlackOutlinedButton type="button" onClick={() => handleDelete(tag)}>
                    {t('v2:courseTags.vocabulary.delete')}
                  </BlackOutlinedButton>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

export default TagVocabularyTab
