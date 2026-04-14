import { z } from 'zod'
export const StringArraySchema = z.array(z.string().min(1))
export const AnswerSchema = z.record(z.string().min(1), z.union([z.string().min(1), z.array(z.string().min(1))]))

export type Answer = z.infer<typeof AnswerSchema>

const LocalizedTextSchema = z.object({
  fi: z.string(),
  sv: z.string(),
  en: z.string(),
})

const FilterOptionSchema = z.object({
  id: z.string(),
  name: LocalizedTextSchema,
  valueOverride: z.string().nullable().optional(),
  setStrict: z.boolean().nullable().optional(),
})

const FilterVariantSchema = z.object({
  name: z.string(),
  skipped: z.boolean().optional(),
  question: LocalizedTextSchema,
  explanation: LocalizedTextSchema.optional(),
  options: z.array(FilterOptionSchema).optional(),
})

export const FilterUpdateSchema = z.object({
  effects: z.string(),
  mandatory: z.boolean(),
  type: z.string(),
  shortName: LocalizedTextSchema,
  explanation: LocalizedTextSchema.nullable().optional(),
  extraInfo: LocalizedTextSchema.nullable().optional(),
  parentFilterId: z.string().nullable().optional(),
  displayOrder: z.number().int(),
  displayType: z.string().nullable().optional(),
  superToggle: z.boolean(),
  hideInCurrentFiltersDisplay: z.boolean(),
  hideInRecommendationReasons: z.boolean(),
  hideInFilterSidebar: z.boolean(),
  showInWelcomeModal: z.boolean(),
  isStrictByDefault: z.boolean(),
  enabled: z.boolean(),
  variants: z.array(FilterVariantSchema).min(1),
})

export const FilterCreateSchema = FilterUpdateSchema.extend({
  id: z.string().regex(/^[a-z0-9-]+$/, 'id must be lowercase alphanumeric with hyphens'),
})
