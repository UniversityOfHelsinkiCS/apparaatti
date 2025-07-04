import { DataTypes } from 'sequelize'

import { type Migration } from '../connection.ts'

//this migration was renamed so to prevent this from running again it is commented away

export const up: Migration = async ({ context: queryInterface }) => {
//  await queryInterface.addColumn('curs','custom_code_urns', {
//    type: DataTypes.JSONB,
//    allowNull: true,
//  })
 
}

export const down: Migration = async ({ context: queryInterface }) => {
//  await queryInterface.removeColumn('curs', 'custom_code_urns')
}

