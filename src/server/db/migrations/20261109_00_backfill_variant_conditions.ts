import { QueryTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

/**
 * Variants used to be matched by name through a hardcoded client-side lookup table
 * (variantLookUp in useQuestions.tsx). That table is gone; variants now carry their
 * matching conditions (organisationCode/lang/primaryLanguage/primaryLanguageSpecification)
 * directly. This backfills those conditions on existing rows from the old lookup table,
 * so previously-authored variants keep resolving the same way they used to.
 */
const REVERSE_LOOKUP: Record<
  string,
  {
    organisationCode: string | null
    lang: string | null
    primaryLanguage: string | null
    primaryLanguageSpecification: string | null
  }
> = {
  default: { organisationCode: null, lang: null, primaryLanguage: null, primaryLanguageSpecification: null },
  fi_unknown: { organisationCode: null, lang: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: null },
  fi_primary_written: {
    organisationCode: null,
    lang: 'fi',
    primaryLanguage: 'fi',
    primaryLanguageSpecification: 'written',
  },
  fi_primary_spoken: {
    organisationCode: null,
    lang: 'fi',
    primaryLanguage: 'fi',
    primaryLanguageSpecification: 'spoken',
  },
  fi_primary_any: {
    organisationCode: null,
    lang: 'fi',
    primaryLanguage: 'fi',
    primaryLanguageSpecification: 'writtenAndSpoken',
  },
  fi_secondary_any: { organisationCode: null, lang: 'fi', primaryLanguage: 'sv', primaryLanguageSpecification: null },
  en_secondary_any: { organisationCode: null, lang: 'en', primaryLanguage: null, primaryLanguageSpecification: null },
  sv_unknown: { organisationCode: null, lang: 'sv', primaryLanguage: 'sv', primaryLanguageSpecification: null },
  sv_primary_written: {
    organisationCode: null,
    lang: 'sv',
    primaryLanguage: 'sv',
    primaryLanguageSpecification: 'written',
  },
  sv_primary_spoken: {
    organisationCode: null,
    lang: 'sv',
    primaryLanguage: 'sv',
    primaryLanguageSpecification: 'spoken',
  },
  sv_primary_any: { organisationCode: null, lang: 'sv', primaryLanguage: 'sv', primaryLanguageSpecification: null },
  sv_secondary_any: { organisationCode: null, lang: 'sv', primaryLanguage: null, primaryLanguageSpecification: null },
}

type LegacyVariant = {
  name: string
  organisationCode?: string | null
  lang?: string | null
  primaryLanguage?: string | null
  primaryLanguageSpecification?: string | null
  [key: string]: unknown
}

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async transaction => {
    const rows = await queryInterface.sequelize.query<{ id: string; variants: LegacyVariant[] }>(
      'SELECT id, variants FROM filters',
      { type: QueryTypes.SELECT, transaction }
    )

    for (const row of rows) {
      const variants = row.variants.map(variant => {
        if (
          variant.organisationCode !== undefined &&
          variant.lang !== undefined &&
          variant.primaryLanguage !== undefined &&
          variant.primaryLanguageSpecification !== undefined
        ) {
          return variant
        }

        const conditions = REVERSE_LOOKUP[variant.name] ?? {
          organisationCode: null,
          lang: null,
          primaryLanguage: null,
          primaryLanguageSpecification: null,
        }

        return { ...variant, ...conditions }
      })

      await queryInterface.sequelize.query('UPDATE filters SET variants = :variants WHERE id = :id', {
        replacements: { variants: JSON.stringify(variants), id: row.id },
        transaction,
      })
    }
  })
}

export const down: Migration = async () => {
  // Condition fields are additive; no down-migration needed.
}
