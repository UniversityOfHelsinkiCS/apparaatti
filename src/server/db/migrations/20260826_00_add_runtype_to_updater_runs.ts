import { DataTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('updater_runs', 'runtype', {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'full',
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('updater_runs', 'runtype')
}
