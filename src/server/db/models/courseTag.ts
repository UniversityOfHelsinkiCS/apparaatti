import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'

export class CourseTag extends Model {}

CourseTag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    key: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'CourseTag',
    tableName: 'course_tags',
    timestamps: true,
    underscored: true,
  }
)

export default CourseTag
