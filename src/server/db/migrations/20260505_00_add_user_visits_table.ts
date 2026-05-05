import { DataTypes, JSONB } from 'sequelize'

import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('user_visits', {
    visitorHashHex: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('user_visits')
}
