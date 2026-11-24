import { FormControlLabel, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { Option } from '../../../common/types'
import { foreignLanguage } from '../../util/contentLanguage'
import OptionTextEditHandle from '../editMode/OptionTextEditHandle'
import HyRadio from './hy/HyRadio'
import OptionCountBadge, { useOptionCountText } from './OptionCountBadge'
import ShrinkwrapText from './ShrinkwrapText'

interface SingleChoiceOptionProps {
  option: Option
  filterId: string
  count?: number | null
}

const SingleChoiceOption = ({ option, filterId, count }: SingleChoiceOptionProps) => {
  const optionCountText = useOptionCountText()
  const { i18n } = useTranslation()
  const nameLang = foreignLanguage(option.nameLanguage, i18n.resolvedLanguage ?? i18n.language)
  const accessibleName = count != null ? `${option.name}, ${optionCountText(count)}` : option.name
  const name = <ShrinkwrapText lang={nameLang}>{option.name}</ShrinkwrapText>
  const label =
    count != null ? (
      <span aria-hidden style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {name}
        <OptionCountBadge count={count} />
      </span>
    ) : (
      name
    )

  const row = (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <FormControlLabel
        value={option.id}
        data-testid={`${filterId}-option-${option.id}`}
        control={
          <HyRadio
            slotProps={{ input: { 'aria-disabled': count === 0, 'aria-label': accessibleName, lang: nameLang } }}
          />
        }
        label={label}
        sx={{
          py: '2px',
          // overriding weird MUI default negative margin stuff
          marginLeft: '-4px',
          marginRight: '4px',
          opacity: count === 0 ? 0.5 : 1,
          cursor: 'default',
        }}
      />
      <OptionTextEditHandle optionId={option.id} name={option.name} />
    </Stack>
  )

  return row
}

export default SingleChoiceOption
