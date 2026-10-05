import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'
import CourseTag from './courseTag.ts'

export class PublishedCuCourseTag extends Model {}

PublishedCuCourseTag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    cuId: { type: DataTypes.STRING, allowNull: false },
    courseTagId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    modelName: 'PublishedCuCourseTag',
    tableName: 'published_cu_course_tags',
    timestamps: true,
    underscored: true,
  }
)

PublishedCuCourseTag.belongsTo(CourseTag, { foreignKey: 'courseTagId', as: 'tag' })

export default PublishedCuCourseTag
