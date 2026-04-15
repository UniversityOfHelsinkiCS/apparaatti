import type { Migration } from '../connection.ts'

const STRICT_DEFAULT_IDS = [
  'study-field-select',
  'primary-language',
  'lang',
  'primary-language-specification',
  'previusly-done-lang',
  'study-year',
  'study-period',
]

const SPECIFIC_ORG_FILTER = {
  id: 'spesificOrg',
  mandatory: false,
  short_name: { fi: 'Oma organisaatio', sv: 'Egen organisation', en: 'Own organisation' },
  explanation: null,
  extra_info: null,
  parent_filter_id: null,
  display_order: 6,
  display_type: null,
  super_toggle: false,
  hide_in_current_filters_display: true,
  hide_in_recommendation_reasons: true,
  hide_in_filter_sidebar: true,
  show_in_welcome_modal: false,
  coordinate_key: 'spesificOrg',
  is_strict_by_default: true,
  enabled: true,
  variants: [
    {
      name: 'default',
      skipped: true,
      question: {
        fi: 'Rajaa oman organisaation kurssit',
        sv: 'Begränsa till kurser i den egna organisationen',
        en: 'Restrict to courses in the user\'s own organisation',
      },
    },
  ],
}

const toJsonbLiteral = (value: unknown) => `'${JSON.stringify(value).replace(/'/g, '\'\'')}'::jsonb`

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(
    `UPDATE filters
     SET is_strict_by_default = TRUE
     WHERE id IN (${STRICT_DEFAULT_IDS.map((id) => `'${id}'`).join(', ')})`
  )

  await queryInterface.sequelize.query(
    `INSERT INTO filters (
      id,
      mandatory,
      short_name,
      explanation,
      extra_info,
      parent_filter_id,
      display_order,
      display_type,
      super_toggle,
      hide_in_current_filters_display,
      hide_in_recommendation_reasons,
      hide_in_filter_sidebar,
      show_in_welcome_modal,
      coordinate_key,
      is_strict_by_default,
      enabled,
      variants,
      created_at,
      updated_at
    ) VALUES (
      '${SPECIFIC_ORG_FILTER.id}',
      ${SPECIFIC_ORG_FILTER.mandatory},
      ${toJsonbLiteral(SPECIFIC_ORG_FILTER.short_name)},
      NULL,
      NULL,
      NULL,
      ${SPECIFIC_ORG_FILTER.display_order},
      NULL,
      ${SPECIFIC_ORG_FILTER.super_toggle},
      ${SPECIFIC_ORG_FILTER.hide_in_current_filters_display},
      ${SPECIFIC_ORG_FILTER.hide_in_recommendation_reasons},
      ${SPECIFIC_ORG_FILTER.hide_in_filter_sidebar},
      ${SPECIFIC_ORG_FILTER.show_in_welcome_modal},
      '${SPECIFIC_ORG_FILTER.coordinate_key}',
      ${SPECIFIC_ORG_FILTER.is_strict_by_default},
      ${SPECIFIC_ORG_FILTER.enabled},
      ${toJsonbLiteral(SPECIFIC_ORG_FILTER.variants)},
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      mandatory = EXCLUDED.mandatory,
      short_name = EXCLUDED.short_name,
      explanation = EXCLUDED.explanation,
      extra_info = EXCLUDED.extra_info,
      parent_filter_id = EXCLUDED.parent_filter_id,
      display_order = EXCLUDED.display_order,
      display_type = EXCLUDED.display_type,
      super_toggle = EXCLUDED.super_toggle,
      hide_in_current_filters_display = EXCLUDED.hide_in_current_filters_display,
      hide_in_recommendation_reasons = EXCLUDED.hide_in_recommendation_reasons,
      hide_in_filter_sidebar = EXCLUDED.hide_in_filter_sidebar,
      show_in_welcome_modal = EXCLUDED.show_in_welcome_modal,
      coordinate_key = EXCLUDED.coordinate_key,
      is_strict_by_default = EXCLUDED.is_strict_by_default,
      enabled = EXCLUDED.enabled,
      variants = EXCLUDED.variants,
      updated_at = NOW()`
  )
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.bulkDelete('filters', { id: 'spesificOrg' })

  await queryInterface.sequelize.query(
    `UPDATE filters
     SET is_strict_by_default = FALSE
     WHERE id IN (${STRICT_DEFAULT_IDS.map((id) => `'${id}'`).join(', ')})`
  )
}