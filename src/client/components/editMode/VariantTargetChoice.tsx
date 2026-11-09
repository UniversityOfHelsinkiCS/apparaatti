import { FormControlLabel, Radio, RadioGroup, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  describeConditions,
  isCatchAll,
  type MatchConditions,
  type VariantQuery,
} from '../../../common/conditionMatching'
import type { FilterVariant } from '../../../common/types'
import type { ValueDraft } from '../admin/backendLocaleEdit/backendLocaleUtils'
import ConditionSelectors from '../admin/backendLocaleEdit/ConditionSelectors'
import BlackContainedButton from '../common/BlackContainedButton'

const NEW_VARIANT = '__new__'

export type PickedTarget = { mode: 'existing'; variantName: string } | { mode: 'new'; conditions: MatchConditions }

interface VariantTargetChoiceProps {
  filterVariants: FilterVariant[]
  currentVariantName: string
  variantQuery: VariantQuery
  onPick: (picked: PickedTarget) => void
}

const variantLabel = (variant: FilterVariant, t: (key: string) => string): string =>
  isCatchAll(variant) ? t('v2:filterWordings.choice.default') : describeConditions(variant)

const VariantTargetChoice = ({
  filterVariants,
  currentVariantName,
  variantQuery,
  onPick,
}: VariantTargetChoiceProps) => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string>(currentVariantName)
  const [draft, setDraft] = useState<ValueDraft>({
    organisationCode: variantQuery.organisationCode,
    lang: variantQuery.lang,
    primaryLanguage: variantQuery.primaryLanguage,
    primaryLanguageSpecification: variantQuery.primaryLanguageSpecification,
    text: { fi: '', sv: '', en: '' },
  })

  const confirm = () => {
    if (selected === NEW_VARIANT) {
      onPick({
        mode: 'new',
        conditions: {
          organisationCode: draft.organisationCode || null,
          lang: draft.lang || null,
          primaryLanguage: draft.primaryLanguage || null,
          primaryLanguageSpecification: draft.primaryLanguageSpecification || null,
        },
      })
      return
    }
    onPick({ mode: 'existing', variantName: selected })
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2">{t('v2:filterWordings.choice.pickTarget')}</Typography>
      <RadioGroup value={selected} onChange={event => setSelected(event.target.value)}>
        {filterVariants.map(variant => (
          <FormControlLabel
            key={variant.name}
            value={variant.name}
            control={<Radio size="small" />}
            label={variantLabel(variant, t)}
          />
        ))}
        <FormControlLabel
          value={NEW_VARIANT}
          control={<Radio size="small" />}
          label={t('v2:filterWordings.choice.createNew')}
        />
      </RadioGroup>

      {selected === NEW_VARIANT && (
        <ConditionSelectors draft={draft} onChange={patch => setDraft(current => ({ ...current, ...patch }))} />
      )}

      <BlackContainedButton type="button" onClick={confirm} sx={{ alignSelf: 'flex-start' }}>
        {t('v2:filterWordings.choice.continue')}
      </BlackContainedButton>
    </Stack>
  )
}

export default VariantTargetChoice
