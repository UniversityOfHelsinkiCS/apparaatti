import { Chip, Paper, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { VariantQuery } from '../../../common/conditionMatching'
import type { Question, Variant } from '../../../common/types'
import EditableText from './EditableText'

interface HiddenFilterWordingRowProps {
  filter: Question
  variant: Variant | undefined
  variantName: string
  isFallbackVariant: boolean
  variantQuery: VariantQuery
  reason: 'hiddenInSidebar' | 'welcomeModalOnly' | 'variantSkipped' | 'noVariant'
}

const HiddenFilterWordingRow = ({
  filter,
  variant,
  variantName,
  isFallbackVariant,
  variantQuery,
  reason,
}: HiddenFilterWordingRowProps) => {
  const { t } = useTranslation()
  const isReadOnly = reason === 'variantSkipped' || reason === 'noVariant'

  const texts = (
    <Stack spacing={1}>
      <Typography variant="body2">
        {t('v2:filterWordings.hidden.shortName')}:{' '}
        <EditableText filterId={filter.id} field="shortName" current={filter.raw?.shortName}>
          {filter.shortName ?? filter.id}
        </EditableText>
      </Typography>
      {variant && (
        <Typography variant="body2">
          {t('v2:filterWordings.hidden.question')}:{' '}
          <EditableText
            filterId={filter.id}
            field="question"
            variantName={variantName}
            isFallbackVariant={isFallbackVariant}
            variantQuery={variantQuery}
            filterVariants={filter.raw?.variants ?? []}
            current={variant.raw?.question}
          >
            {variant.question}
          </EditableText>
        </Typography>
      )}
      {(variant?.options ?? []).map(option => (
        <Typography variant="body2" key={option.id}>
          {t('v2:filterWordings.hidden.option')}:{' '}
          <EditableText
            filterId={filter.id}
            field="option"
            optionId={option.id}
            variantName={variantName}
            isFallbackVariant={isFallbackVariant}
            variantQuery={variantQuery}
            filterVariants={filter.raw?.variants ?? []}
            current={variant?.raw?.options?.find(candidate => candidate.id === option.id)?.name}
          >
            {option.name}
          </EditableText>
        </Typography>
      ))}
    </Stack>
  )

  const readOnlyTexts = (
    <Stack spacing={1}>
      <Typography variant="body2">
        {t('v2:filterWordings.hidden.shortName')}: {filter.shortName ?? filter.id}
      </Typography>
      {variant && (
        <Typography variant="body2">
          {t('v2:filterWordings.hidden.question')}: {variant.question}
        </Typography>
      )}
    </Stack>
  )

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Typography variant="subtitle2">{filter.id}</Typography>
          <Chip size="small" label={t(`v2:filterWordings.hidden.reason.${reason}`)} />
          {isReadOnly && <Chip size="small" color="warning" label={t('v2:filterWordings.hidden.readOnly')} />}
        </Stack>
        {isReadOnly ? readOnlyTexts : texts}
      </Stack>
    </Paper>
  )
}

export default HiddenFilterWordingRow
