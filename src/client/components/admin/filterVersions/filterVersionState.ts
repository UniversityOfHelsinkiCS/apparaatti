const EDITING_VERSION_KEY = 'apparaatti-filter-wording-version'
const PENDING_VARIANT_PICK_KEY = 'apparaatti-filter-wording-pick-variant'

export const readEditingFilterVersionId = (): number | null => {
  try {
    const stored = window.localStorage.getItem(EDITING_VERSION_KEY)
    if (!stored) return null

    const parsed = Number(stored)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  } catch {
    return null
  }
}

export const storeEditingFilterVersionId = (id: number | null) => {
  try {
    if (id === null) window.localStorage.removeItem(EDITING_VERSION_KEY)
    else window.localStorage.setItem(EDITING_VERSION_KEY, String(id))
  } catch {
    return
  }
}

export const readVariantPickPending = (): boolean => {
  try {
    return window.localStorage.getItem(PENDING_VARIANT_PICK_KEY) !== null
  } catch {
    return false
  }
}

export const storeVariantPickPending = (isPending: boolean) => {
  try {
    if (isPending) window.localStorage.setItem(PENDING_VARIANT_PICK_KEY, 'true')
    else window.localStorage.removeItem(PENDING_VARIANT_PICK_KEY)
  } catch {
    return
  }
}
