import { DataTypes, JSONB } from 'sequelize'

import { sequelize, type Migration } from '../connection.ts'
import Cur from '../models/cur.ts'
import Cu from '../models/cu.ts'
import CurCu from '../models/curCu.ts'

export const up: Migration = async ({ context: queryInterface }) => {  
  Cur.belongsToMany(Cu, {through: CurCu})
  Cu.belongsToMany(Cur, {through: CurCu})
}

export const down: Migration = async ({ context: queryInterface }) => {
}
