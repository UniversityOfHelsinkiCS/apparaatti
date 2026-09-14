import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'
import RecommendationLanguage from './recommendationLanguage.ts'

export class RecommendationCode extends Model {}

RecommendationCode.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    organisationCode: { type: DataTypes.STRING, allowNull: false },
    languageId: { type: DataTypes.INTEGER, allowNull: false },
    courseCode: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'RecommendationCode',
    tableName: 'recommendation_codes',
    timestamps: true,
    underscored: true,
  }
)

RecommendationLanguage.hasMany(RecommendationCode, { foreignKey: 'languageId', as: 'codes' })
RecommendationCode.belongsTo(RecommendationLanguage, { foreignKey: 'languageId', as: 'language' })

export default RecommendationCode
