import { DataTypes } from 'sequelize'
import type { Migration } from '../connection.ts'
import { seedFilters } from '../seedFilters.ts'

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
  shortName: { fi: 'Oma organisaatio', sv: 'Egen organisation', en: 'Own organisation' },
  displayOrder: 6,
  superToggle: false,
  hideInCurrentFiltersDisplay: true,
  hideInRecommendationReasons: true,
  hideInFilterSidebar: true,
  showInWelcomeModal: false,
  coordinateKey: 'spesificOrg',
  isStrictByDefault: true,
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

const tableName = (table: unknown) => {
  if (typeof table === 'string') {
    return table
  }

  if (table && typeof table === 'object' && 'tableName' in table && typeof table.tableName === 'string') {
    return table.tableName
  }

  return null
}

export const up: Migration = async ({ context: queryInterface }) => {
  const existingTables = await queryInterface.showAllTables()
  const filtersTableExists = existingTables.some((table) => tableName(table) === 'filters')

  if (filtersTableExists) {
    await queryInterface.dropTable('filters')
  }

  await queryInterface.createTable('filters', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    mandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    short_name: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    extra_info: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    parent_filter_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    display_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    super_toggle: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hide_in_current_filters_display: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hide_in_recommendation_reasons: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hide_in_filter_sidebar: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    show_in_welcome_modal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    coordinate_key: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_strict_by_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    variants: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  await queryInterface.addConstraint('filters', {
    fields: ['parent_filter_id'],
    type: 'foreign key',
    name: 'filters_parent_filter_id_fkey',
    references: {
      table: 'filters',
      field: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })

  await seedFilters()

  await queryInterface.bulkUpdate(
    'filters',
    { is_strict_by_default: true },
    { id: STRICT_DEFAULT_IDS }
  )

  await queryInterface.bulkInsert('filters', [
    {
      id: SPECIFIC_ORG_FILTER.id,
      mandatory: SPECIFIC_ORG_FILTER.mandatory,
      short_name: JSON.stringify(SPECIFIC_ORG_FILTER.shortName),
      explanation: null,
      extra_info: null,
      parent_filter_id: null,
      display_order: SPECIFIC_ORG_FILTER.displayOrder,
      display_type: null,
      super_toggle: SPECIFIC_ORG_FILTER.superToggle,
      hide_in_current_filters_display: SPECIFIC_ORG_FILTER.hideInCurrentFiltersDisplay,
      hide_in_recommendation_reasons: SPECIFIC_ORG_FILTER.hideInRecommendationReasons,
      hide_in_filter_sidebar: SPECIFIC_ORG_FILTER.hideInFilterSidebar,
      show_in_welcome_modal: SPECIFIC_ORG_FILTER.showInWelcomeModal,
      coordinate_key: SPECIFIC_ORG_FILTER.coordinateKey,
      is_strict_by_default: SPECIFIC_ORG_FILTER.isStrictByDefault,
      enabled: SPECIFIC_ORG_FILTER.enabled,
      variants: JSON.stringify(SPECIFIC_ORG_FILTER.variants),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ])
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('filters')
}