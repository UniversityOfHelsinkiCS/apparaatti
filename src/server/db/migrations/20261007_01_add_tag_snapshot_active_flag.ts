import { DataTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

// Before this column the live tagging was only implied by the newest "Applied …"
// snapshot, which stops being true as soon as one is renamed or deleted. Backfill
// makes that old implication explicit once, for existing data.
const BACKFILL_SQL = `
  UPDATE tag_snapshots
  SET is_active = true
  WHERE id = (SELECT id FROM tag_snapshots WHERE name LIKE 'Applied %' ORDER BY created_at DESC LIMIT 1)
`

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.addColumn(
      'tag_snapshots',
      'is_active',
      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      { transaction }
    )

    await queryInterface.sequelize.query(BACKFILL_SQL, { transaction })
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('tag_snapshots', 'is_active')
}
