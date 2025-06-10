import { DataTypes, JSONB } from 'sequelize'

import { sequelize, type Migration } from '../connection.ts'
import Cur from '../models/cur.ts'
import Cu from '../models/cu.ts'
import CurCu from '../models/curCu.ts'

export const up: Migration = async ({ context: queryInterface }) => {  
  await queryInterface.addColumn('studyrights', 'education_phase_1', {type: DataTypes.JSONB, allowNull: true })
  await queryInterface.addColumn('studyrights', 'education_phase_2', {type: DataTypes.JSONB, allowNull: true })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('studyrights', 'education_phase_1')
  await queryInterface.removeColumn('studyrights', 'education_phase_2')
}
