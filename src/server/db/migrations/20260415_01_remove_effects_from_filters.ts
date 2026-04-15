import { DataTypes } from 'sequelize'
import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('filters', 'effects')
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('filters', 'effects', {
    type: DataTypes.STRING,
    allowNull: true,
  })

  await queryInterface.sequelize.query(
    `UPDATE filters
     SET effects = COALESCE(coordinate_key, 'none')
     WHERE effects IS NULL`
  )

  await queryInterface.changeColumn('filters', 'effects', {
    type: DataTypes.STRING,
    allowNull: false,
  })
}