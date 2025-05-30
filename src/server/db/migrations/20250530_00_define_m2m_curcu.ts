import { DataTypes, JSONB } from 'sequelize'

import { sequelize, type Migration } from '../connection.ts'
import Cur from '../models/cur.ts'
import Cu from '../models/cu.ts'
import CurCu from '../models/curCu.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  
  await queryInterface.addColumn('CurCu', 'CurId', {
    type: DataTypes.STRING,
    references: {
      model: Cur,
      key: 'id'
    }
  })
  
  await queryInterface.addColumn('CurCu', 'CuId', {
    type: DataTypes.STRING,
    references: {
      model: Cu,
      key: 'id'
    }
  })
  Cur.belongsToMany(Cu, {through: CurCu})
  Cu.belongsToMany(Cur, {through: CurCu})
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn('CurCu', 'CurId')
  await queryInterface.removeColumn('CurCu', 'CuId')
}
