import { FormControlLabel } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { Option } from '../../../common/types'
import { foreignLanguage } from '../../util/contentLanguage'
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
  const label =
    count != null ? (
      <span aria-hidden style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <ShrinkwrapText lang={nameLang}>{option.name}</ShrinkwrapText>
        <OptionCountBadge count={count} />
      </span>
    ) : (
      <ShrinkwrapText lang={nameLang}>{option.name}</ShrinkwrapText>
    )
  return (
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
  )
}

export default SingleChoiceOption
