const EDITING_VERSION_KEY = 'apparaatti-filter-wording-version'

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
