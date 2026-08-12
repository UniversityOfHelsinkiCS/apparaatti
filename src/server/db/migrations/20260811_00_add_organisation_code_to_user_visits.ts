import { DataTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('user_visits', 'organisation_code', {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('user_visits', 'organisation_code')
}
