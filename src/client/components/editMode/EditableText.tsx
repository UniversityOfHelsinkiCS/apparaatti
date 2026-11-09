import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { useRef } from 'react'

import { ANY_VARIANT_QUERY, type VariantQuery } from '../../../common/conditionMatching'
import type { FilterVariant, FilterWordingField, LocalizedText } from '../../../common/types'
import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import { hy } from '../common/hy/hyTokens'

const emptyLocalized: LocalizedText = { fi: '', sv: '', en: '' }

interface EditableTextProps {
  filterId: string
  field: FilterWordingField
  optionId?: string | null
  variantName?: string
  isFallbackVariant?: boolean
  variantQuery?: VariantQuery
  filterVariants?: FilterVariant[]
  current: LocalizedText | null | undefined
  children: ReactNode
}

const EditableText = ({
  filterId,
  field,
  optionId = null,
  variantName = '',
  isFallbackVariant = false,
  variantQuery = ANY_VARIANT_QUERY,
  filterVariants = [],
  current,
  children,
}: EditableTextProps) => {
  const { isEditMode, openTarget } = useFilterEditMode()
  const ref = useRef<HTMLElement>(null)

  if (!isEditMode) {
    return <>{children}</>
  }

  const open = () => {
    if (!ref.current) {
      return
    }

    openTarget({
      filterId,
      field,
      optionId,
      variantName,
      isFallbackVariant,
      variantQuery,
      filterVariants,
      current: current ?? emptyLocalized,
      anchor: ref.current,
    })
  }

  const editable = (
    <Box
      component="span"
      ref={ref}
      role="button"
      tabIndex={0}
      data-testid={`editable-${filterId}-${field}${optionId ? `-${optionId}` : ''}`}
      onClick={event => {
        event.stopPropagation()
        event.preventDefault()
        open()
      }}
      onKeyDown={event => {
        if (event.key !== 'Enter' && event.key !== ' ') {
          return
        }
        event.stopPropagation()
        event.preventDefault()
        open()
      }}
      sx={{
        cursor: 'pointer',
        outline: '1px dashed',
        outlineColor: hy.borderColor.info,
        outlineOffset: '2px',
        borderRadius: '2px',
        transition: 'background-color 120ms ease-in-out, outline-color 120ms ease-in-out',
        '&:hover, &:focus-visible': {
          backgroundColor: hy.bgColor.infoHover,
          outlineColor: hy.borderColor.primary,
          outlineStyle: 'solid',
        },
      }}
    >
      {children}
    </Box>
  )

  return editable
}

export default EditableText
