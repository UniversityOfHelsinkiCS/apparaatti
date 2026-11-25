import { Box, Stack } from '@mui/material'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'

import type { VariantQuery } from '../../common/conditionMatching'
import type { FilterVariant, Language, LocalizedText } from '../../common/types'
import { useFilterEditMode } from '../contexts/filterEditModeContext'
import ActiveFilterChips from './ActiveFilterChips'
import HyTag from './common/hy/HyTag'
import { hy } from './common/hy/hyTokens'
import FilterTextEditHandle from './editMode/FilterTextEditHandle'

type FilterAccordionActionProps = {
  filterId: string
  shortName: string
  triggerRef: RefObject<HTMLButtonElement | null>
  variantName: string
  isFallbackVariant: boolean
  variantQuery: VariantQuery
  filterVariants: FilterVariant[]
  current: LocalizedText | null | undefined
  filterText: LocalizedText | null | undefined
}

export const FilterAccordionAction = ({
  filterId,
  shortName,
  triggerRef,
  variantName,
  isFallbackVariant,
  variantQuery,
  filterVariants,
  current,
  filterText,
}: FilterAccordionActionProps) => {
  const { t } = useTranslation()
  const { isEditMode } = useFilterEditMode()

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <ActiveFilterChips filterId={filterId} focusRef={triggerRef} />
      {isEditMode && (
        <FilterTextEditHandle
          filterId={filterId}
          field="variantShortName"
          variantName={variantName}
          isFallbackVariant={isFallbackVariant}
          variantQuery={variantQuery}
          filterVariants={filterVariants}
          current={current}
          filterText={filterText ?? null}
          label={t('v2:filterWordings.editName', { name: shortName })}
        />
      )}
    </Stack>
  )
}

type FilterAccordionSummaryProps = {
  mandatory: boolean
  shortName: string
  shortNameLanguage: Language | undefined
}

export const FilterAccordionSummary = ({ mandatory, shortName, shortNameLanguage }: FilterAccordionSummaryProps) => {
  const { t } = useTranslation()

  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        flexWrap: 'wrap',
        gap: 1,
        '& > *': { minHeight: '26px' },
      }}
    >
      {mandatory && (
        <HyTag
          text={t('question:mandatory')}
          colour="attention"
          sx={{ border: '1px solid', borderColor: hy.borderColor.light }}
        />
      )}
      <Box component="span" lang={shortNameLanguage} sx={{ flexGrow: 1 }}>
        {shortName}
      </Box>
    </Box>
  )
}
