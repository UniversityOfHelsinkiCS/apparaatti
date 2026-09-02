import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'

export class BackendLocaleKey extends Model {}

BackendLocaleKey.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    key: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    modelName: 'BackendLocaleKey',
    tableName: 'backend_locale_keys',
    timestamps: true,
    underscored: true,
  }
)

export default BackendLocaleKey
