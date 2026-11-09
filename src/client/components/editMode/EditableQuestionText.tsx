import type { ReactNode } from 'react'

import EditableText from './EditableText'
import { useEditScope } from './editScope'

const EditableQuestionText = ({ children }: { children: ReactNode }) => {
  const scope = useEditScope()

  if (!scope) {
    return <>{children}</>
  }

  const text = (
    <EditableText
      filterId={scope.filterId}
      field="question"
      variantName={scope.variantName}
      isFallbackVariant={scope.isFallbackVariant}
      variantQuery={scope.variantQuery}
      filterVariants={scope.rawFilter?.variants ?? []}
      current={scope.rawVariant?.question}
    >
      {children}
    </EditableText>
  )

  return text
}

export default EditableQuestionText
