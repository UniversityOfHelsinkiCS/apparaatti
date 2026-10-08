import { TableCell, TableRow, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { CourseTag } from '../../../../common/types.ts'
import BlackOutlinedButton from '../../common/BlackOutlinedButton.tsx'

interface TagVocabularyRowProps {
  tag: CourseTag
  isEditable: boolean
  isSuperuser: boolean
  onDescriptionSave: (tag: CourseTag, description: string) => void
  onDelete: (tag: CourseTag) => void
}

const TagVocabularyRow = ({ tag, isEditable, isSuperuser, onDescriptionSave, onDelete }: TagVocabularyRowProps) => {
  const { t } = useTranslation()

  return (
    <TableRow>
      <TableCell>{tag.key}</TableCell>
      <TableCell>
        <TextField
          size="small"
          fullWidth
          defaultValue={tag.description ?? ''}
          disabled={!isEditable}
          onBlur={event => onDescriptionSave(tag, event.target.value)}
        />
      </TableCell>
      <TableCell align="right">
        {isSuperuser && isEditable ? (
          <BlackOutlinedButton type="button" onClick={() => onDelete(tag)}>
            {t('v2:courseTags.vocabulary.delete')}
          </BlackOutlinedButton>
        ) : null}
      </TableCell>
    </TableRow>
  )
}

export default TagVocabularyRow
