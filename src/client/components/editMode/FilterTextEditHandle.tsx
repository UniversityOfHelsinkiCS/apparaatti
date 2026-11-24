import { Pencil } from 'lucide-react'

import { ANY_VARIANT_QUERY, type VariantQuery } from '../../../common/conditionMatching'
import type { FilterVariant, FilterWordingField, LocalizedText } from '../../../common/types'
import EditableText from './EditableText'

type FilterTextEditHandleProps = {
  filterId: string
  field: FilterWordingField
  optionId?: string | null
  variantName?: string
  isFallbackVariant?: boolean
  variantQuery?: VariantQuery
  filterVariants?: FilterVariant[]
  current: LocalizedText | null | undefined
  label: string
}

const FilterTextEditHandle = ({
  filterId,
  field,
  optionId = null,
  variantName = '',
  isFallbackVariant = false,
  variantQuery = ANY_VARIANT_QUERY,
  filterVariants = [],
  current,
  label,
}: FilterTextEditHandleProps) => (
  <EditableText
    filterId={filterId}
    field={field}
    optionId={optionId}
    variantName={variantName}
    isFallbackVariant={isFallbackVariant}
    variantQuery={variantQuery}
    filterVariants={filterVariants}
    current={current}
    ariaLabel={label}
  >
    <Pencil size={16} />
  </EditableText>
)

export default FilterTextEditHandle
