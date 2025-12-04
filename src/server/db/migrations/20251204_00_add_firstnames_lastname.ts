

import { DataTypes } from 'sequelize'

import { type Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('users','first_names', {
    type: DataTypes.STRING, 
    allowNull: true,
  })
 
  await queryInterface.addColumn('users','last_name', {
    type: DataTypes.STRING, 
    allowNull: true,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('users', 'first_names')
  await queryInterface.removeColumn('users', 'last_name')
}

