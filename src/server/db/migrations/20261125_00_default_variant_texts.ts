import { QueryTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

type Conditions = {
  organisationCode: string | null
  lang: string | null
  primaryLanguage: string | null
  primaryLanguageSpecification: string | null
}

type LocalizedText = { fi: string; sv: string; en: string }

type Variant = Partial<Conditions> & {
  name: string
  question?: LocalizedText
  shortName?: LocalizedText
  explanation?: LocalizedText
  extraInfo?: LocalizedText
  options?: unknown[]
  [key: string]: unknown
}

type FilterRow = {
  id: string
  shortName: LocalizedText
  explanation: LocalizedText | null
  extraInfo: LocalizedText | null
  variants: Variant[]
}

const EMPTY_TEXT: LocalizedText = { fi: '', sv: '', en: '' }

const CATCH_ALL: Conditions = {
  organisationCode: null,
  lang: null,
  primaryLanguage: null,
  primaryLanguageSpecification: null,
}

const isCatchAll = (variant: Variant): boolean => {
  if (variant.organisationCode) return false
  if (variant.lang) return false
  if (variant.primaryLanguage) return false
  if (variant.primaryLanguageSpecification) return false
  return true
}

const freeName = (variants: Variant[]): string => {
  if (!variants.some(variant => variant.name === 'default')) {
    return 'default'
  }
  let index = 2
  while (variants.some(variant => variant.name === `default_${index}`)) {
    index += 1
  }
  return `default_${index}`
}

export const withDefaultTexts = (
  variants: Variant[],
  texts: { shortName: LocalizedText; explanation: LocalizedText | null; extraInfo: LocalizedText | null }
): Variant[] => {
  const existing = variants.find(isCatchAll)

  const fill = (variant: Variant): Variant => {
    const filled: Variant = { ...variant }
    if (filled.shortName === undefined) {
      filled.shortName = texts.shortName
    }
    if (filled.explanation === undefined && texts.explanation !== null) {
      filled.explanation = texts.explanation
    }
    if (filled.extraInfo === undefined && texts.extraInfo !== null) {
      filled.extraInfo = texts.extraInfo
    }
    return filled
  }

  if (existing) {
    return variants.map(variant => (variant === existing ? fill(variant) : variant))
  }

  const created = fill({
    name: freeName(variants),
    ...CATCH_ALL,
    question: variants[0]?.question ?? EMPTY_TEXT,
    options: variants[0]?.options ? structuredClone(variants[0].options) : undefined,
  })

  return [...variants, created]
}

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async transaction => {
    const filters = await queryInterface.sequelize.query<FilterRow>(
      'SELECT id, short_name AS "shortName", explanation, extra_info AS "extraInfo", variants FROM filters',
      { type: QueryTypes.SELECT, transaction }
    )

    for (const row of filters) {
      const variants = withDefaultTexts(row.variants ?? [], {
        shortName: row.shortName ?? EMPTY_TEXT,
        explanation: row.explanation,
        extraInfo: row.extraInfo,
      })

      await queryInterface.sequelize.query('UPDATE filters SET variants = :variants WHERE id = :id', {
        replacements: { variants: JSON.stringify(variants), id: row.id },
        transaction,
      })
    }

    const snapshots = await queryInterface.sequelize.query<{ id: number; payload: { filters?: FilterRow[] } }>(
      'SELECT id, payload FROM filter_snapshots',
      { type: QueryTypes.SELECT, transaction }
    )

    for (const snapshot of snapshots) {
      const configs = snapshot.payload?.filters
      if (!Array.isArray(configs)) {
        continue
      }

      const migrated = configs.map(config => ({
        ...config,
        variants: withDefaultTexts(config.variants ?? [], {
          shortName: config.shortName ?? EMPTY_TEXT,
          explanation: config.explanation ?? null,
          extraInfo: config.extraInfo ?? null,
        }),
      }))

      await queryInterface.sequelize.query('UPDATE filter_snapshots SET payload = :payload WHERE id = :id', {
        replacements: { payload: JSON.stringify({ ...snapshot.payload, filters: migrated }), id: snapshot.id },
        transaction,
      })
    }
  })
}

export const down: Migration = async () => {}
