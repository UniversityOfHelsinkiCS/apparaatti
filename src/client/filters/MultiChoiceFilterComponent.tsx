import { FormControlLabel, FormGroup } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { Option, Question } from '../../common/types'
import HyCheckbox from '../components/common/hy/HyCheckbox.tsx'
import OptionCountBadge, { useOptionCountText } from '../components/common/OptionCountBadge.tsx'
import ShrinkwrapText from '../components/common/ShrinkwrapText.tsx'
import EditableOptionLabel from '../components/editMode/EditableOptionLabel.tsx'
import { questionGroupName, questionTextId } from '../components/QuestionTitle'
import { useFilterContext } from '../contexts/filterContext'
import { foreignLanguage } from '../util/contentLanguage'

interface MultiChoiceFilterComponentProps {
  filter: Question
  state: string[]
  handleCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  options: Option[]
  scope?: string
}

const MultiChoiceFilterComponent: React.FC<MultiChoiceFilterComponentProps> = ({
  filter,
  state,
  handleCheckboxChange,
  options,
  scope,
}) => {
  const { getOptionCount } = useFilterContext()
  const optionCountText = useOptionCountText()
  const { i18n } = useTranslation()
  const uiLanguage = i18n.resolvedLanguage ?? i18n.language

  return (
    <FormGroup role="group" aria-labelledby={questionTextId(filter.id, scope)}>
      {options.map(option => {
        const count = getOptionCount(filter.id, option.id)
        const nameLang = foreignLanguage(option.nameLanguage, uiLanguage)
        const accessibleName = count != null ? `${option.name}, ${optionCountText(count)}` : option.name
        const label =
          count != null ? (
            <span aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <EditableOptionLabel optionId={option.id}>
                <ShrinkwrapText lang={nameLang}>{option.name}</ShrinkwrapText>
              </EditableOptionLabel>
              <OptionCountBadge count={count} />
            </span>
          ) : (
            <EditableOptionLabel optionId={option.id}>
              <span lang={nameLang}>{option.name}</span>
            </EditableOptionLabel>
          )
        return (
          <FormControlLabel
            checked={state.includes(option.id)}
            key={option.id}
            name={questionGroupName(filter.id, scope)}
            value={option.id}
            data-testid={`${filter.id}-option-${option.id}`}
            control={
              <HyCheckbox
                onChange={handleCheckboxChange}
                slotProps={{ input: { 'aria-label': accessibleName, lang: nameLang } }}
              />
            }
            label={label}
            sx={{
              py: '2px',
              // overriding weird MUI default negative margin stuff
              marginLeft: '-4px',
              marginRight: '4px',
              cursor: 'default',
            }}
          />
        )
      })}
    </FormGroup>
  )
}

export default MultiChoiceFilterComponent
