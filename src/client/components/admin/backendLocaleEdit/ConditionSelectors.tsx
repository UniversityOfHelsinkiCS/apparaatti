import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { useId } from 'react'
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
  const organisationSelectId = useId()
  const langSelectId = useId()
  const primaryLanguageSelectId = useId()
  const specificationSelectId = useId()

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
      <FormControl fullWidth size="small">
        <InputLabel shrink id={organisationSelectId}>
          {t('v2:admin.backendLocales.organisation')}
        </InputLabel>
        <Select
          labelId={organisationSelectId}
          label={t('v2:admin.backendLocales.organisation')}
          value={draft.organisationCode}
          displayEmpty
          renderValue={selected => (selected === '' ? anyLabel : selected)}
          onChange={e => onChange({ organisationCode: e.target.value })}
        >
          <MenuItem value="">{anyLabel}</MenuItem>
          {(organisations ?? []).map(organisation => (
            <MenuItem key={organisation.code} value={organisation.code}>
              {organisation.code} — {translateLocalizedString(organisation.name as LocalizedString)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel shrink id={langSelectId}>
          {t('v2:admin.backendLocales.lang')}
        </InputLabel>
        <Select
          labelId={langSelectId}
          label={t('v2:admin.backendLocales.lang')}
          value={draft.lang}
          displayEmpty
          renderValue={selected => (selected === '' ? anyLabel : t(`v2:admin.backendLocales.langOption.${selected}`))}
          onChange={e => changeLanguageCondition({ lang: e.target.value })}
        >
          <MenuItem value="">{anyLabel}</MenuItem>
          {LANGS.map(lang => (
            <MenuItem key={lang} value={lang}>
              {t(`v2:admin.backendLocales.langOption.${lang}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth size="small">
        <InputLabel shrink id={primaryLanguageSelectId}>
          {t('v2:admin.backendLocales.primaryLanguage')}
        </InputLabel>
        <Select
          labelId={primaryLanguageSelectId}
          label={t('v2:admin.backendLocales.primaryLanguage')}
          value={draft.primaryLanguage}
          displayEmpty
          renderValue={selected => (selected === '' ? anyLabel : t(`v2:admin.backendLocales.langOption.${selected}`))}
          onChange={e => changeLanguageCondition({ primaryLanguage: e.target.value })}
        >
          <MenuItem value="">{anyLabel}</MenuItem>
          {PRIMARY_LANGUAGES.map(primaryLanguage => (
            <MenuItem key={primaryLanguage} value={primaryLanguage}>
              {t(`v2:admin.backendLocales.langOption.${primaryLanguage}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <FormControl fullWidth size="small" disabled={specificationDisabled}>
          <InputLabel shrink id={specificationSelectId}>
            {t('v2:admin.backendLocales.specification')}
          </InputLabel>
          <Select
            labelId={specificationSelectId}
            label={t('v2:admin.backendLocales.specification')}
            value={specificationDisabled ? '' : draft.primaryLanguageSpecification}
            displayEmpty
            renderValue={selected =>
              selected === '' ? anyLabel : t(`v2:admin.backendLocales.specificationOption.${selected}`)
            }
            onChange={e => onChange({ primaryLanguageSpecification: e.target.value })}
          >
            <MenuItem value="">{anyLabel}</MenuItem>
            {PRIMARY_LANGUAGE_SPECIFICATIONS.map(specification => (
              <MenuItem key={specification} value={specification}>
                {t(`v2:admin.backendLocales.specificationOption.${specification}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
