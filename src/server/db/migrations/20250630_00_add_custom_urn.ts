import { DataTypes } from 'sequelize'

import { type Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('curs','custom_code_urns', {
    type: DataTypes.JSONB,
    allowNull: true,
  })
 
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('curs', 'custom_code_urns')
}

