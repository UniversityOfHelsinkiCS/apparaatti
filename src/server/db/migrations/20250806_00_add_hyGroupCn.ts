import { DataTypes } from 'sequelize'

import { type Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('users', 'hy_group_cn', {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('users', 'hy_group_cn')
}
