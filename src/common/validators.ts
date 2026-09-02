import { z } from 'zod'
export const StringArraySchema = z.array(z.string().min(1))
export const AnswerSchema = z.record(z.string().min(1), z.union([z.string().min(1), z.array(z.string().min(1))]))

export type Answer = z.infer<typeof AnswerSchema>

export const LocalizedTextSchema = z.object({
  fi: z.string(),
  sv: z.string(),
  en: z.string(),
})

const FilterOptionSchema = z.object({
  id: z.string(),
  name: LocalizedTextSchema,
  valueOverride: z.string().nullable().optional(),
  selectedByDefault: z.boolean().nullable().optional(),
})

const FilterVariantSchema = z.object({
  name: z.string(),
  skipped: z.boolean().optional(),
  question: LocalizedTextSchema,
  explanation: LocalizedTextSchema.optional(),
  options: z.array(FilterOptionSchema).optional(),
})

export const FilterUpdateSchema = z.object({
  mandatory: z.boolean(),
  shortName: LocalizedTextSchema,
  explanation: LocalizedTextSchema.nullable().optional(),
  extraInfo: LocalizedTextSchema.nullable().optional(),
  parentFilterId: z.string().nullable().optional(),
  displayOrder: z.number().int(),
  displayType: z.string().nullable().optional(),
  hideInCurrentFiltersDisplay: z.boolean(),
  hideInRecommendationReasons: z.boolean(),
  hideInFilterSidebar: z.boolean(),
  showInWelcomeModal: z.boolean(),
  enabled: z.boolean(),
  variants: z.array(FilterVariantSchema).min(1),
})

export const FilterCreateSchema = FilterUpdateSchema.extend({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be lowercase alphanumeric with hyphens'),
})

export const FilterImportItemSchema = FilterUpdateSchema.extend({
  id: z.string(),
  coordinateKey: z.string().nullable().optional(),
})

export const FilterConfigImportSchema = z.object({
  appVersion: z.string().optional(),
  exportedAt: z.string().optional(),
  filters: z.array(FilterImportItemSchema),
})

export const UserFeedbackSchema = z.object({
  textFeedback: z.string().trim().min(1),
  stars: z.number().int().min(0).max(5),
  recommendationMetadata: z
    .object({
      filterState: z.record(z.string(), z.unknown()).nullable(),
      courses: z.array(z.record(z.string(), z.unknown())),
    })
    .optional(),
  appVersion: z.string().optional(),
  sendContactEmail: z.boolean().optional(),
})

export const UserSettingsSchema = z.object({
  educationLanguage: z.string().min(1),
})

export const LANGS = ['fi', 'sv', 'en'] as const
export const PRIMARY_LANGUAGES = ['fi', 'sv'] as const
export const PRIMARY_LANGUAGE_SPECIFICATIONS = ['writtenAndSpoken', 'written', 'spoken'] as const

export const BackendLocaleKeySchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9.\-_]*$/, 'key must be alphanumeric with dots, hyphens or underscores'),
  description: z.string().trim().min(1),
})

export const BackendLocaleKeyUpdateSchema = BackendLocaleKeySchema.pick({ description: true })

const BackendLocaleValueFields = z.object({
  organisationCode: z.string().min(1).nullable().default(null),
  lang: z.enum(LANGS).nullable().default(null),
  primaryLanguage: z.enum(PRIMARY_LANGUAGES).nullable().default(null),
  primaryLanguageSpecification: z.enum(PRIMARY_LANGUAGE_SPECIFICATIONS).nullable().default(null),
  text: LocalizedTextSchema,
})

export function specificationCanBeMatched(lang: string | null, primaryLanguage: string | null) {
  if (lang === 'en') return false
  if (lang !== null && primaryLanguage !== null && lang !== primaryLanguage) return false
  return true
}

export const BackendLocaleValueSchema = BackendLocaleValueFields.refine(
  value => value.primaryLanguageSpecification === null || specificationCanBeMatched(value.lang, value.primaryLanguage),
  {
    message: 'This combination can never be matched',
    path: ['primaryLanguageSpecification'],
  }
)

export const BackendLocaleQuerySchema = z.object({
  organisation: z.string().optional(),
  lang: z.enum(LANGS).optional(),
  primaryLanguage: z.enum(PRIMARY_LANGUAGES).optional(),
  primaryLanguageSpecification: z.enum(PRIMARY_LANGUAGE_SPECIFICATIONS).optional(),
})

export const BackendLocaleImportSchema = z.object({
  appVersion: z.string().optional(),
  exportedAt: z.string().optional(),
  keys: z.array(BackendLocaleKeySchema.extend({ values: z.array(BackendLocaleValueSchema) })),
})
