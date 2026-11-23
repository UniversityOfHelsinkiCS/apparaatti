import { apiFetch } from '../../../util/useApi.tsx'

export const DISPLAY_TYPES = ['radio', 'dropdownselect', 'multichoice', 'singlechoice', 'info-only']

export const SWITCH_SX = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: 'black' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'black' },
}

export const adminFetch = (method: string, path: string, body?: unknown) => apiFetch(path, method, body)
