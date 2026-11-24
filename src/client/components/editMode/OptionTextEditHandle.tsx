import { useTranslation } from 'react-i18next'

import { useFilterEditMode } from '../../contexts/filterEditModeContext'
import { useEditScope } from './editScope'
import FilterTextEditHandle from './FilterTextEditHandle'

type OptionTextEditHandleProps = {
  optionId: string
  name: string
}

const OptionTextEditHandle = ({ optionId, name }: OptionTextEditHandleProps) => {
  const { t } = useTranslation()
  const { isEditMode } = useFilterEditMode()
  const scope = useEditScope()

  if (!isEditMode || !scope) {
    return null
  }

  return (
    <FilterTextEditHandle
      filterId={scope.filterId}
      field="option"
      optionId={optionId}
      variantName={scope.variantName}
      isFallbackVariant={scope.isFallbackVariant}
      variantQuery={scope.variantQuery}
      filterVariants={scope.rawFilter?.variants ?? []}
      current={scope.rawVariant?.options?.find(option => option.id === optionId)?.name}
      label={t('v2:filterWordings.editOption', { name })}
    />
  )
}

export default OptionTextEditHandle
