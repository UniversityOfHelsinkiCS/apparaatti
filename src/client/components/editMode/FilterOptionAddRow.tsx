import { Paper, Stack, TextField } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { LocalizedText } from '../../../common/types'
import LocalizedField from '../admin/filterEdit/LocalizedField'
import BlackOutlinedButton from '../common/BlackOutlinedButton'
import { emptyLocalized } from './wordingMutations'

type FilterOptionAddRowProps = {
  onAdd: (optionId: string, name: LocalizedText) => void
}

const FilterOptionAddRow = ({ onAdd }: FilterOptionAddRowProps) => {
  const { t } = useTranslation()
  const [optionId, setOptionId] = useState('')
  const [name, setName] = useState<LocalizedText>(emptyLocalized)

  const add = () => {
    if (optionId.trim() === '') {
      return
    }
    onAdd(optionId.trim(), name)
    setOptionId('')
    setName(emptyLocalized)
  }

  const row = (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <TextField
          size="small"
          label={t('v2:filterSettings.optionId')}
          value={optionId}
          onChange={event => setOptionId(event.target.value)}
        />
        <LocalizedField
          size="small"
          values={name}
          textFieldLabel={t('v2:filterSettings.optionName')}
          onChange={(language, value) => setName(current => ({ ...current, [language]: value }))}
        />
        <BlackOutlinedButton type="button" disabled={optionId.trim() === ''} onClick={add}>
          {t('v2:filterSettings.addOption')}
        </BlackOutlinedButton>
      </Stack>
    </Paper>
  )

  return row
}

export default FilterOptionAddRow
