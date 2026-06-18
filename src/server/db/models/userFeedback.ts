import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

import type { RecommendationMetadata } from '../../../common/types.ts'
import { sequelize } from '../connection.ts'

class UserFeedback extends Model<InferAttributes<UserFeedback>, InferCreationAttributes<UserFeedback>> {
  declare id: CreationOptional<number>
  declare textFeedback: string
  declare stars: number
  declare recommendationMetadata: CreationOptional<RecommendationMetadata | null>
  declare appVersion: CreationOptional<string | null>
  declare email: CreationOptional<string | null>
  declare date: Date
}

UserFeedback.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    textFeedback: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recommendationMetadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    appVersion: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
  }
)

export default UserFeedback
