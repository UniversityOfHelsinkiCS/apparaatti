import { DataTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('user_visits', 'phase1_programme_code', {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  })
  await queryInterface.addColumn('user_visits', 'phase1_programme_name', {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null,
  })
  await queryInterface.addColumn('user_visits', 'phase2_programme_code', {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  })
  await queryInterface.addColumn('user_visits', 'phase2_programme_name', {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: null,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('user_visits', 'phase1_programme_code')
  await queryInterface.removeColumn('user_visits', 'phase1_programme_name')
  await queryInterface.removeColumn('user_visits', 'phase2_programme_code')
  await queryInterface.removeColumn('user_visits', 'phase2_programme_name')
}
