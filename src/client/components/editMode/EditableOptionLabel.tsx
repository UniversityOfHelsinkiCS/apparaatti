import type { ReactNode } from 'react'

import EditableText from './EditableText'
import { useEditScope } from './editScope'

interface EditableOptionLabelProps {
  optionId: string
  children: ReactNode
}

const EditableOptionLabel = ({ optionId, children }: EditableOptionLabelProps) => {
  const scope = useEditScope()

  if (!scope) {
    return <>{children}</>
  }

  return (
    <EditableText
      filterId={scope.filterId}
      field="option"
      optionId={optionId}
      variantName={scope.variantName}
      isFallbackVariant={scope.isFallbackVariant}
      variantQuery={scope.variantQuery}
      filterVariants={scope.rawFilter?.variants ?? []}
      current={scope.rawVariant?.options?.find(option => option.id === optionId)?.name}
    >
      {children}
    </EditableText>
  )
}

export default EditableOptionLabel
