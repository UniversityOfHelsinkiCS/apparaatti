import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag } from '../../../../common/types.ts'
import { adminFetch } from '../filterEdit/filterEditorUtils.ts'
import { COURSE_TAGS_PATH } from './courseTagUtils.ts'
import { matrixContainerSx } from './matrixStyles.ts'
import TagVocabularyForm from './TagVocabularyForm.tsx'
import TagVocabularyRow from './TagVocabularyRow.tsx'

interface TagVocabularyTabProps {
  tags: CourseTag[]
  isSuperuser: boolean
}

const TagVocabularyTab = ({ tags, isSuperuser }: TagVocabularyTabProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['course-tags'] })

  const handleCreate = async (key: string, description: string | null) => {
    const response = await adminFetch('POST', COURSE_TAGS_PATH, { key, description })
    if (!response.ok) {
      setError(
        response.status === 409 ? t('v2:courseTags.vocabulary.duplicate') : t('v2:courseTags.vocabulary.invalid')
      )
      return false
    }

    setError('')
    await refresh()
    return true
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
      <TagVocabularyForm onCreate={handleCreate} />

      {error ? <Typography color="error">{error}</Typography> : null}

      <TableContainer sx={matrixContainerSx}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>{t('v2:courseTags.vocabulary.key')}</TableCell>
              <TableCell>{t('v2:courseTags.vocabulary.description')}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {tags.map(tag => (
              <TagVocabularyRow
                key={tag.id}
                tag={tag}
                isSuperuser={isSuperuser}
                onDescriptionSave={handleDescriptionSave}
                onDelete={handleDelete}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default TagVocabularyTab
