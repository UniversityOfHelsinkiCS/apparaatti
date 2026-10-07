import { Autocomplete, TextField } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { CourseTag } from '../../../../common/types.ts'

interface BulkTagSelectProps {
  tags: CourseTag[]
  selectedTags: CourseTag[]
  onChange: (tags: CourseTag[]) => void
}

const BulkTagSelect = ({ tags, selectedTags, onChange }: BulkTagSelectProps) => {
  const { t } = useTranslation()

  return (
    <Autocomplete
      multiple
      autoHighlight
      selectOnFocus
      handleHomeEndKeys
      disableCloseOnSelect
      options={tags}
      value={selectedTags}
      onChange={(_event, value) => onChange(value)}
      getOptionLabel={tag => tag.key}
      isOptionEqualToValue={(option, value) => option.key === value.key}
      slotProps={{ listbox: { sx: { maxHeight: 200 } } }}
      renderInput={params => (
        <TextField {...params} label={t('v2:courseTags.bulk.tags')} helperText={t('v2:courseTags.bulk.tagsHint')} />
      )}
    />
  )
}

export default BulkTagSelect
