import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'
import CourseTag from './courseTag.ts'

export class PublishedCurCourseTag extends Model {}

PublishedCurCourseTag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    curId: { type: DataTypes.STRING, allowNull: false },
    courseTagId: { type: DataTypes.INTEGER, allowNull: false },
    mode: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'PublishedCurCourseTag',
    tableName: 'published_cur_course_tags',
    timestamps: true,
    underscored: true,
    indexes: [
      { name: 'published_cur_course_tags_uniq', unique: true, fields: ['cur_id', 'course_tag_id'] },
      { name: 'published_cur_course_tags_cur_idx', fields: ['cur_id'] },
    ],
  }
)

PublishedCurCourseTag.belongsTo(CourseTag, { foreignKey: 'courseTagId', as: 'tag' })

export default PublishedCurCourseTag
