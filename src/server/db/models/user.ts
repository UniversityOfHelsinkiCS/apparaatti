import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'
import type UserSettings from './userSettings.ts'

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string
  declare username: string
  declare firstNames: CreationOptional<string>
  declare lastName: CreationOptional<string>
  declare hyGroupCn: CreationOptional<string[]>
  declare language?: CreationOptional<string>
  declare studentNumber: CreationOptional<string>
  declare email: CreationOptional<string | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare userSettings?: UserSettings
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstNames: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hyGroupCn: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
    },
    studentNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    timestamps: true,
  }
)

export default User
