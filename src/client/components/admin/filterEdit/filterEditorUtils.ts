import type { FilterConfig } from '../../../../common/types.ts'

export const DISPLAY_TYPES = ['radio', 'dropdownselect', 'multichoice', 'singlechoice']

export const SWITCH_SX = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: 'black' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'black' },
}

export const blankLocalized = () => ({ fi: '', sv: '', en: '' })

export const blankFilter = (): FilterConfig => ({
  id: '',
  mandatory: false,
  shortName: blankLocalized(),
  explanation: blankLocalized(),
  extraInfo: blankLocalized(),
  parentFilterId: null,
  displayOrder: 0,
  displayType: null,
  superToggle: false,
  hideInCurrentFiltersDisplay: false,
  hideInRecommendationReasons: false,
  hideInFilterSidebar: false,
  showInWelcomeModal: false,
  isStrictByDefault: false,
  enabled: true,
  variants: [{ name: 'default', question: blankLocalized(), options: [] }],
})

export const normalizeDraft = (f: FilterConfig): FilterConfig => ({
  ...f,
  explanation: f.explanation ?? blankLocalized(),
  extraInfo: f.extraInfo ?? blankLocalized(),
  variants: (f.variants ?? []).map((v) => ({
    ...v,
    options: v.options ?? [],
  })),
})

export const toNullIfEmpty = (
  loc: { fi: string; sv: string; en: string } | null | undefined
) => {
  if (!loc) return null
  if (!loc.fi && !loc.sv && !loc.en) return null
  return loc
}

export const adminFetch = (method: string, path: string, body?: unknown) =>
  fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
