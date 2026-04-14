import { DataTypes } from 'sequelize'
import type { Migration } from '../connection.ts'
import { seedFilters } from '../seedFilters.ts'

const COORDINATE_KEYS: Record<string, string> = {
  'study-field-select': 'org',
  'lang':              'lang',
  'study-period':      'date',
  'multi-period':      'multiPeriod',
  'replacement':       'replacement',
  'mentoring':         'mentoring',
  'finmu':             'finmu',
  'challenge':         'challenge',
  'graduation':        'graduation',
  'study-place':       'studyPlace',
  'integrated':        'integrated',
  'independent':       'independent',
  'mooc':              'mooc',
  'collaboration':     'collaboration',
  'flexible':          'flexible',
}

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('filters', 'coordinate_key', {
    type: DataTypes.STRING,
    allowNull: true,
  })

  await seedFilters()

  for (const [filterId, coordinateKey] of Object.entries(COORDINATE_KEYS)) {
    await queryInterface.sequelize.query(
      `UPDATE filters SET coordinate_key = :coordinateKey WHERE id = :filterId`,
      { replacements: { coordinateKey, filterId } }
    )
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('filters', 'coordinate_key')
}
