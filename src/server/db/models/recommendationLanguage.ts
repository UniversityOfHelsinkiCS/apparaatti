import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'

export class RecommendationLanguage extends Model {}

RecommendationLanguage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: { type: DataTypes.JSONB, allowNull: false },
    lang: { type: DataTypes.STRING, allowNull: false },
    languageType: { type: DataTypes.STRING, allowNull: true },
    primaryLanguageSpecification: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: 'RecommendationLanguage',
    tableName: 'recommendation_languages',
    timestamps: true,
    underscored: true,
  }
)

export default RecommendationLanguage
