import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'
import BackendLocaleKey from './backendLocaleKey.ts'

export class BackendLocaleValue extends Model {}

BackendLocaleValue.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    key: { type: DataTypes.STRING, allowNull: false },
    organisationCode: { type: DataTypes.STRING, allowNull: true },
    lang: { type: DataTypes.STRING, allowNull: true },
    primaryLanguage: { type: DataTypes.STRING, allowNull: true },
    primaryLanguageSpecification: { type: DataTypes.STRING, allowNull: true },
    text: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    sequelize,
    modelName: 'BackendLocaleValue',
    tableName: 'backend_locale_values',
    timestamps: true,
    underscored: true,
  }
)

BackendLocaleKey.hasMany(BackendLocaleValue, { foreignKey: 'key', sourceKey: 'key', as: 'values' })
BackendLocaleValue.belongsTo(BackendLocaleKey, { foreignKey: 'key', targetKey: 'key' })

export default BackendLocaleValue
