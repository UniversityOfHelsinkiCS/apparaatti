import type { ReactNode } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'

import type { VariantQuery } from '../../common/conditionMatching'
import type { FilterWordingField, LocalizedText } from '../../common/types'
import {
  readEditingFilterVersionId,
  storeEditingFilterVersionId,
} from '../components/admin/filterVersions/filterVersionState'

export type EditTarget = {
  filterId: string
  field: FilterWordingField
  optionId: string | null
  variantName: string
  isFallbackVariant: boolean
  variantQuery: VariantQuery
  current: LocalizedText
  anchor: HTMLElement
}

type FilterEditModeValue = {
  editingVersionId: number | null
  isEditMode: boolean
  target: EditTarget | null
  savedField: FilterWordingField | null
  openTarget: (target: EditTarget) => void
  closeTarget: () => void
  notifySaved: (field: FilterWordingField) => void
  clearSaved: () => void
  enterEditMode: (versionId: number) => void
  exitEditMode: () => void
}

const FilterEditModeContext = createContext<FilterEditModeValue>({
  editingVersionId: null,
  isEditMode: false,
  target: null,
  savedField: null,
  openTarget: () => {},
  closeTarget: () => {},
  notifySaved: () => {},
  clearSaved: () => {},
  enterEditMode: () => {},
  exitEditMode: () => {},
})

export const useFilterEditMode = () => useContext(FilterEditModeContext)

export const FilterEditModeProvider = ({ isAdmin, children }: { isAdmin: boolean; children: ReactNode }) => {
  const [editingVersionId, setEditingVersionId] = useState<number | null>(() =>
    isAdmin ? readEditingFilterVersionId() : null
  )
  const [target, setTarget] = useState<EditTarget | null>(null)
  const [savedField, setSavedField] = useState<FilterWordingField | null>(null)

  const value = useMemo<FilterEditModeValue>(
    () => ({
      editingVersionId: isAdmin ? editingVersionId : null,
      isEditMode: isAdmin && editingVersionId !== null,
      target,
      savedField,
      openTarget: setTarget,
      closeTarget: () => setTarget(null),
      notifySaved: setSavedField,
      clearSaved: () => setSavedField(null),
      enterEditMode: (versionId: number) => {
        storeEditingFilterVersionId(versionId)
        setEditingVersionId(versionId)
      },
      exitEditMode: () => {
        storeEditingFilterVersionId(null)
        setEditingVersionId(null)
        setTarget(null)
      },
    }),
    [isAdmin, editingVersionId, target, savedField]
  )

  return <FilterEditModeContext.Provider value={value}>{children}</FilterEditModeContext.Provider>
}
