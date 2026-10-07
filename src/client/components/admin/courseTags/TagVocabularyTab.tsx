import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CourseTag, TagVocabMutation } from '../../../../common/types.ts'
import { matrixContainerSx } from './matrixStyles.ts'
import TagVocabularyForm from './TagVocabularyForm.tsx'
import TagVocabularyRow from './TagVocabularyRow.tsx'

interface TagVocabularyTabProps {
  tags: CourseTag[]
  isSuperuser: boolean
  onTagMutation: (mutation: TagVocabMutation) => void
}

const TagVocabularyTab = ({ tags, isSuperuser, onTagMutation }: TagVocabularyTabProps) => {
  const { t } = useTranslation()
  const [error, setError] = useState('')

  const handleCreate = async (key: string, description: string | null) => {
    if (tags.some(tag => tag.key === key)) {
      setError(t('v2:courseTags.vocabulary.duplicate'))
      return false
    }

    setError('')
    onTagMutation({ op: 'upsert', key, description })
    return true
  }

  const handleDescriptionSave = async (tag: CourseTag, description: string) => {
    onTagMutation({ op: 'upsert', key: tag.key, description: description || null })
  }

  const handleDelete = async (tag: CourseTag) => {
    if (!window.confirm(t('v2:courseTags.vocabulary.deleteConfirm', { key: tag.key }))) return
    onTagMutation({ op: 'delete', key: tag.key })
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
                key={tag.key}
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
