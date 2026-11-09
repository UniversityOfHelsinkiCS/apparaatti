import { z } from 'zod'

import { organisationCodeToName } from './organisations.ts'

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

export const LANGS = ['fi', 'sv', 'en'] as const
export const PRIMARY_LANGUAGES = ['fi', 'sv'] as const
export const PRIMARY_LANGUAGE_SPECIFICATIONS = ['writtenAndSpoken', 'written', 'spoken'] as const

export function specificationCanBeMatched(lang: string | null, primaryLanguage: string | null) {
  if (lang === 'en') return false
  if (lang !== null && primaryLanguage !== null && lang !== primaryLanguage) return false
  return true
}

const FilterVariantFields = z.object({
  name: z.string(),
  organisationCode: z.string().min(1).nullable().default(null),
  lang: z.enum(LANGS).nullable().default(null),
  primaryLanguage: z.enum(PRIMARY_LANGUAGES).nullable().default(null),
  primaryLanguageSpecification: z.enum(PRIMARY_LANGUAGE_SPECIFICATIONS).nullable().default(null),
  skipped: z.boolean().optional(),
  question: LocalizedTextSchema,
  explanation: LocalizedTextSchema.optional(),
  options: z.array(FilterOptionSchema).optional(),
})

const FilterVariantSchema = FilterVariantFields.refine(
  value => value.primaryLanguageSpecification === null || specificationCanBeMatched(value.lang, value.primaryLanguage),
  {
    message: 'This combination can never be matched',
    path: ['primaryLanguageSpecification'],
  }
)

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

export const LANGUAGE_TYPES = ['primary', 'secondary'] as const

export const RecommendationLanguageSchema = z.object({
  name: LocalizedTextSchema,
  lang: z.enum(LANGS),
  languageType: z.enum(LANGUAGE_TYPES).nullable().default(null),
  primaryLanguageSpecification: z
    .enum(PRIMARY_LANGUAGE_SPECIFICATIONS)
    .exclude(['writtenAndSpoken'])
    .nullable()
    .default(null),
})

export const RecommendationCodeSchema = z.object({
  organisationCode: z
    .string()
    .min(1)
    .refine(code => code in organisationCodeToName, 'Unknown organisation'),
  languageId: z.number().int().positive(),
  courseCode: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z0-9\-/.]+$/, 'course code must be alphanumeric with hyphens, slashes or dots'),
})

export const RecommendationCodeImportSchema = z.object({
  appVersion: z.string().optional(),
  exportedAt: z.string().optional(),
  languages: z.array(RecommendationLanguageSchema.extend({ id: z.number().int().positive() })),
  codes: z.array(RecommendationCodeSchema),
})

export const COURSE_TAG_MODES = ['add', 'ignore'] as const

export const MAX_TAG_IMPORT_ROWS = 200000

export const CourseTagModeSchema = z.enum(COURSE_TAG_MODES)

export const CourseTagSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z0-9\-:_.]+$/, 'tag key must be alphanumeric with hyphens, colons, underscores or dots'),
  description: z.string().trim().nullable().default(null),
})

export const TagBaseSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('published') }),
  z.object({ kind: z.literal('snapshot'), id: z.number().int().positive() }),
])

export const TagMutationsSchema = z.object({
  tags: z
    .array(
      z.discriminatedUnion('op', [
        z.object({ op: z.literal('upsert'), key: z.string().trim().min(1), description: z.string().trim().nullable() }),
        z.object({ op: z.literal('delete'), key: z.string().trim().min(1) }),
      ])
    )
    .max(MAX_TAG_IMPORT_ROWS),
  cur: z
    .array(
      z.object({
        curId: z.string().min(1),
        tagKey: z.string().trim().min(1),
        mode: z.enum([...COURSE_TAG_MODES, 'clear']),
      })
    )
    .max(MAX_TAG_IMPORT_ROWS),
  cu: z
    .array(
      z.object({
        courseCode: z.string().min(1),
        cuIds: z.array(z.string().min(1)),
        tagKey: z.string().trim().min(1),
        present: z.boolean(),
      })
    )
    .max(MAX_TAG_IMPORT_ROWS),
})

const WithDraftSchema = { base: TagBaseSchema, mutations: TagMutationsSchema }

export const CourseSearchFilterSchema = z.object({
  name: z.string().optional(),
  urn: z.string().optional(),
  urnMode: z.enum(['or', 'and']).optional(),
  excludeUrns: z.string().optional(),
  excludeUrnsMode: z.enum(['or', 'and']).optional(),
  tags: z.string().optional(),
  tagsMode: z.enum(['or', 'and']).optional(),
  excludeTags: z.string().optional(),
  excludeTagsMode: z.enum(['or', 'and']).optional(),
  courseCode: z.string().optional(),
  excludeCourseCodes: z.string().optional(),
  reviewStatus: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export const BulkApplyTagsSchema = z.object({
  filters: CourseSearchFilterSchema,
  base: TagBaseSchema,
  tagKeys: z.array(z.string().trim().min(1)).min(1),
  mode: z.enum([...COURSE_TAG_MODES, 'clear']),
})

export const TagSnapshotMutateSchema = z.object({ mutations: TagMutationsSchema })

export const TagSnapshotMetaSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().default(null),
})

export const TagSnapshotCreateSchema = TagSnapshotMetaSchema.extend(WithDraftSchema)

export const TagCurStateSchema = z.object({
  curIds: z.array(z.string().min(1)),
  base: TagBaseSchema,
})

export const FilterBaseSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('published') }),
  z.object({ kind: z.literal('snapshot'), id: z.number().int().positive() }),
])

const FilterWordingMutationSchema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('createVariant'),
    filterId: z.string().min(1),
    variantName: z.string().trim().min(1),
    fromVariantName: z.string().trim().min(1),
    organisationCode: z.string().min(1).nullable().default(null),
    lang: z.enum(LANGS).nullable().default(null),
    primaryLanguage: z.enum(PRIMARY_LANGUAGES).nullable().default(null),
    primaryLanguageSpecification: z.enum(PRIMARY_LANGUAGE_SPECIFICATIONS).nullable().default(null),
  }),
  z.object({
    op: z.literal('variantQuestion'),
    filterId: z.string().min(1),
    variantName: z.string().trim().min(1),
    text: LocalizedTextSchema,
  }),
  z.object({
    op: z.literal('variantExplanation'),
    filterId: z.string().min(1),
    variantName: z.string().trim().min(1),
    text: LocalizedTextSchema.nullable(),
  }),
  z.object({
    op: z.literal('optionName'),
    filterId: z.string().min(1),
    variantName: z.string().trim().min(1),
    optionId: z.string().min(1),
    text: LocalizedTextSchema,
  }),
  z.object({ op: z.literal('shortName'), filterId: z.string().min(1), text: LocalizedTextSchema }),
  z.object({ op: z.literal('extraInfo'), filterId: z.string().min(1), text: LocalizedTextSchema.nullable() }),
])

export const FilterMutationsSchema = z.object({
  wordings: z.array(FilterWordingMutationSchema),
})

export const FilterSnapshotMutateSchema = z.object({ mutations: FilterMutationsSchema })

export const FilterSnapshotMetaSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().nullable().default(null),
})

export const FilterSnapshotCreateSchema = FilterSnapshotMetaSchema.extend({
  base: FilterBaseSchema,
  mutations: FilterMutationsSchema,
})

export const FilterSnapshotPayloadSchema = z.object({
  appVersion: z.string().optional(),
  exportedAt: z.string().optional(),
  filters: z.array(FilterImportItemSchema),
})

export const TagSnapshotPayloadSchema = z.object({
  appVersion: z.string().optional(),
  exportedAt: z.string().optional(),
  tags: z.array(CourseTagSchema).max(MAX_TAG_IMPORT_ROWS),
  cuTags: z.array(z.object({ cuId: z.string().min(1), tagKey: z.string().min(1) })).max(MAX_TAG_IMPORT_ROWS),
  curTags: z
    .array(z.object({ curId: z.string().min(1), tagKey: z.string().min(1), mode: CourseTagModeSchema }))
    .max(MAX_TAG_IMPORT_ROWS),
})
