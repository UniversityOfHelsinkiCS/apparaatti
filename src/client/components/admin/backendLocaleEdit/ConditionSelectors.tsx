import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import type { LocalizedString } from '../../../../common/types.ts'
import {
  LANGS,
  PRIMARY_LANGUAGE_SPECIFICATIONS,
  PRIMARY_LANGUAGES,
  specificationCanBeMatched,
} from '../../../../common/validators.ts'
import { translateLocalizedString } from '../../../util/i18n.ts'
import useApi from '../../../util/useApi.tsx'
import LabeledSelect from '../LabeledSelect.tsx'
import type { ValueDraft } from './backendLocaleUtils.ts'

type OrganisationOption = {
  id: string
  code: string
  name: unknown
}

type ConditionSelectorsProps = {
  draft: ValueDraft
  onChange: (patch: Partial<ValueDraft>) => void
}

const ConditionSelectors = ({ draft, onChange }: ConditionSelectorsProps) => {
  const { t } = useTranslation()
  const { data: organisations } = useApi<OrganisationOption[]>(
    'supportedOrganisations',
    '/api/organisations/supported',
    'GET'
  )

  const anyLabel = t('v2:admin.backendLocales.anyValue')
  const specificationDisabled = !specificationCanBeMatched(draft.lang || null, draft.primaryLanguage || null)

  const changeLanguageCondition = (patch: Partial<ValueDraft>) => {
    const lang = patch.lang ?? draft.lang
    const primaryLanguage = patch.primaryLanguage ?? draft.primaryLanguage
    if (specificationCanBeMatched(lang || null, primaryLanguage || null)) {
      onChange(patch)
      return
    }
    onChange({ ...patch, primaryLanguageSpecification: '' })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <LabeledSelect
        label={t('v2:admin.backendLocales.organisation')}
        value={draft.organisationCode}
        options={(organisations ?? []).map(organisation => ({
          value: organisation.code,
          label: `${organisation.code} — ${translateLocalizedString(organisation.name as LocalizedString)}`,
        }))}
        onChange={value => onChange({ organisationCode: value })}
        emptyLabel={anyLabel}
      />

      <LabeledSelect
        label={t('v2:admin.backendLocales.lang')}
        value={draft.lang}
        options={LANGS.map(lang => ({ value: lang, label: t(`v2:admin.backendLocales.langOption.${lang}`) }))}
        onChange={value => changeLanguageCondition({ lang: value })}
        emptyLabel={anyLabel}
      />

      <LabeledSelect
        label={t('v2:admin.backendLocales.primaryLanguage')}
        value={draft.primaryLanguage}
        options={PRIMARY_LANGUAGES.map(primaryLanguage => ({
          value: primaryLanguage,
          label: t(`v2:admin.backendLocales.langOption.${primaryLanguage}`),
        }))}
        onChange={value => changeLanguageCondition({ primaryLanguage: value })}
        emptyLabel={anyLabel}
      />

      <Box>
        <LabeledSelect
          label={t('v2:admin.backendLocales.specification')}
          value={specificationDisabled ? '' : draft.primaryLanguageSpecification}
          options={PRIMARY_LANGUAGE_SPECIFICATIONS.map(specification => ({
            value: specification,
            label: t(`v2:admin.backendLocales.specificationOption.${specification}`),
          }))}
          onChange={value => onChange({ primaryLanguageSpecification: value })}
          emptyLabel={anyLabel}
          disabled={specificationDisabled}
        />
        <Typography variant="caption" sx={{ color: specificationDisabled ? '#663c00' : 'text.secondary' }}>
          {specificationDisabled
            ? t('v2:admin.backendLocales.specificationUnreachable')
            : t('v2:admin.backendLocales.specificationHelp')}
        </Typography>
      </Box>
    </Box>
  )
}

export default ConditionSelectors
