import type { ReactNode } from 'react'
import { createContext, useContext, useMemo } from 'react'

import type { FilterConfig, FilterVariant } from '../../../common/types'

type EditScope = {
  filterId: string
  variantName: string
  isFallbackVariant: boolean
  rawFilter?: FilterConfig
  rawVariant?: FilterVariant
}

const EditScopeContext = createContext<EditScope | null>(null)

export const useEditScope = () => useContext(EditScopeContext)

export const EditScopeProvider = ({
  filterId,
  variantName,
  isFallbackVariant,
  rawFilter,
  rawVariant,
  children,
}: EditScope & { children: ReactNode }) => {
  const value = useMemo<EditScope>(
    () => ({ filterId, variantName, isFallbackVariant, rawFilter, rawVariant }),
    [filterId, variantName, isFallbackVariant, rawFilter, rawVariant]
  )

  return <EditScopeContext.Provider value={value}>{children}</EditScopeContext.Provider>
}
