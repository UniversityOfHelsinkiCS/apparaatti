import { DataTypes, JSONB } from 'sequelize'
import { sequelize, type Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {  
  await queryInterface.dropTable('studyrights')
}

export const down: Migration = async ({ context: queryInterface }) => {
 
}
