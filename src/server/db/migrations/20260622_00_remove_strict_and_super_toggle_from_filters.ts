import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('filters', 'super_toggle')
  await queryInterface.removeColumn('filters', 'is_strict_by_default')
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('filters', 'super_toggle', {
    type: 'BOOLEAN',
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.addColumn('filters', 'is_strict_by_default', {
    type: 'BOOLEAN',
    allowNull: false,
    defaultValue: false,
  })
}
