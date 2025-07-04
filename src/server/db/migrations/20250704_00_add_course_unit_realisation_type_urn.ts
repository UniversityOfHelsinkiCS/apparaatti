
import { DataTypes } from 'sequelize'

import { type Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn('curs','course_unit_realisation_type_urn', {
    type: DataTypes.STRING, 
    allowNull: true,
  })
 
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('curs', 'course_unit_realisation_type_urn')
}

