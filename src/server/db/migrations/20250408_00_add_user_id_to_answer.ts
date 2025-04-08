import { DataTypes } from 'sequelize'

import type{ Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('answers', 'user_id', {
    type: DataTypes.STRING,
    allowNull: false,
  })
}

export const down: Migration = ({ context: queryInterface }) =>
  queryInterface.removeColumn('answers', 'user_id')
