import { DataTypes } from 'sequelize'
import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('filters', 'type')
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('filters', 'type', {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'singlechoice',
  })
}