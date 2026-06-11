import { Chip, IconButton, Stack, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Variant } from '../../../common/types'
import { getOptionDisplayTexts } from '../../hooks/useQuestions'

interface FilterSummaryItemProps {
  label: string
  state: string | string[] | undefined
  variant: Variant | null
  onDeleteValue?: (valueId: string) => void
  onClear?: () => void
}

const FilterValueRenderer = ({
  state,
  variant,
  onDeleteValue,
}: {
  state: string | string[]
  variant: Variant | null
  onDeleteValue?: (valueId: string) => void
}) => {
  if (Array.isArray(state) && state.length > 0) {
    return (
      <>
        {state.map(valueId => {
          const option = variant?.options?.find(o => o.id === valueId)
          const displayText = option?.name || valueId

          return (
            <Chip
              key={valueId}
              label={displayText}
              size="small"
              onDelete={onDeleteValue ? () => onDeleteValue(valueId) : undefined}
              sx={{ margin: '2px' }}
            />
          )
        })}
      </>
    )
  }

  return getOptionDisplayTexts(variant, state).map(text => (
    <Typography key={text} variant="body1">
      {text}
    </Typography>
  ))
}

const FilterSummaryItem = ({ label, state, variant, onDeleteValue, onClear }: FilterSummaryItemProps) => {
  const hasMultipleValues = Array.isArray(state) && state.length > 1

  return (
    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
      <Typography variant="body1">
        <strong>{label}: </strong>
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <FilterValueRenderer state={state} variant={variant} onDeleteValue={onDeleteValue} />
      </Stack>
      {onClear && (hasMultipleValues || !Array.isArray(state)) && (
        <IconButton size="small" onClick={onClear} title="Clear all">
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  )
}

export default FilterSummaryItem
