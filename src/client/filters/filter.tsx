import { SelectChangeEvent } from '@mui/material'
import { Box } from '@mui/material'
import { useState } from 'react'

import { ANY_VARIANT_QUERY, type VariantQuery } from '../../common/conditionMatching'
import { Variant } from '../../common/types'
import { EditScopeProvider } from '../components/editMode/editScope'
import ExtraInfoModal from '../components/ExtraInfoModal'
import QuestionTitle from '../components/QuestionTitle'
import DropdownFilterComponent from './DropdownFilterComponent'
import InfoOnlyFilterComponent from './InfoOnlyFilterComponent'
import MultiChoiceFilterComponent from './MultiChoiceFilterComponent'
import SingleChoiceFilterComponent from './SingleChoiceFilterComponent'

/**
 * A filter can be multichoice, single choice, or a drop down menu it can be read from the filter object
 */
const Filter = ({
  variant,
  filter,
  scope,
  variantName,
  isFallbackVariant = false,
  variantQuery,
}: {
  variant: Variant
  filter: any
  scope?: string
  variantName?: string
  isFallbackVariant?: boolean
  variantQuery?: VariantQuery
}) => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const state = filter.state
  const setState = filter.setState

  if (!variant || variant.skipped) {
    return null
  }

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const optionId = event.target.value
    setState(optionId)
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const optionId = event.target.value
    const isChecked = event.target.checked

    if (isChecked) {
      setState([...state, optionId])
    } else {
      setState(state.filter((id: string) => id !== optionId))
    }
  }

  const handleDropdownChange = (event: SelectChangeEvent<string>) => {
    const optionId = event.target.value
    setState(optionId)
  }

  const showAsQuestion = filter.displayType !== 'info-only'

  const rendered = (
    <EditScopeProvider
      filterId={filter.id}
      variantName={variantName ?? variant.name}
      isFallbackVariant={isFallbackVariant}
      variantQuery={variantQuery ?? ANY_VARIANT_QUERY}
      rawFilter={filter.raw}
      rawVariant={variant.raw}
    >
      <Box>
        {showAsQuestion && (
          <>
            <QuestionTitle
              handleOpen={handleOpen}
              title={variant.question}
              titleLanguage={variant.questionLanguage}
              question={filter}
              showMandatoryStatus={scope === 'welcome'}
              scope={scope}
            />
            <ExtraInfoModal question={filter} open={open} handleClose={handleClose} />
          </>
        )}
        <Box sx={{ marginTop: 0.5 }}>
          {(() => {
            switch (filter.displayType) {
              case 'info-only':
                return <InfoOnlyFilterComponent extraInfo={filter.extraInfo} />
              case 'multichoice':
                return (
                  <MultiChoiceFilterComponent
                    filter={filter}
                    state={state}
                    handleCheckboxChange={handleCheckboxChange}
                    options={variant.options || []}
                    scope={scope}
                  />
                )
              case 'dropdownselect':
                return (
                  <DropdownFilterComponent
                    filter={filter}
                    state={state}
                    handleChange={handleDropdownChange}
                    options={variant.options || []}
                    scope={scope}
                  />
                )
              case 'singlechoice':
              default:
                return (
                  <SingleChoiceFilterComponent
                    filter={filter}
                    state={state}
                    handleRadioChange={handleRadioChange}
                    options={variant.options || []}
                    extrainfo={filter.extraInfo}
                    scope={scope}
                  />
                )
            }
          })()}
        </Box>
      </Box>
    </EditScopeProvider>
  )

  return rendered
}

export default Filter
