import type { Language } from '../../common/types'

export const foreignLanguage = (
  contentLanguage: Language | null | undefined,
  uiLanguage: string
): Language | undefined => (contentLanguage && contentLanguage !== uiLanguage ? contentLanguage : undefined)
