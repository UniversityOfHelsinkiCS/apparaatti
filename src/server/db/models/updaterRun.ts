import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'

class UpdaterRun extends Model<InferAttributes<UpdaterRun>, InferCreationAttributes<UpdaterRun>> {
  declare id: CreationOptional<number>
  declare status: string
  declare triggeredBy: CreationOptional<string | null>
  declare error: CreationOptional<string | null>
  declare startedAt: Date
  declare finishedAt: CreationOptional<Date | null>
}

UpdaterRun.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    triggeredBy: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
  }
)

export default UpdaterRun
