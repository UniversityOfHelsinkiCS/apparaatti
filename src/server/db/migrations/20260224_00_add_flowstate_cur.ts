
import { DataTypes } from 'sequelize'

import { type Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('curs','flow_state', {
    type: DataTypes.STRING,
    allowNull: true
  })
 
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('curs', 'flow_state')
}

