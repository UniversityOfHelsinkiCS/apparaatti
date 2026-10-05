import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'
import CourseTag from './courseTag.ts'
import Cu from './cu.ts'

export class CuCourseTag extends Model {}

CuCourseTag.init(
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
    modelName: 'CuCourseTag',
    tableName: 'cu_course_tags',
    timestamps: true,
    underscored: true,
    indexes: [
      { name: 'cu_course_tags_uniq', unique: true, fields: ['cu_id', 'course_tag_id'] },
      { name: 'cu_course_tags_tag_idx', fields: ['course_tag_id'] },
    ],
  }
)

Cu.hasMany(CuCourseTag, { foreignKey: 'cuId', as: 'tagRows' })
CuCourseTag.belongsTo(Cu, { foreignKey: 'cuId', as: 'cu' })
CuCourseTag.belongsTo(CourseTag, { foreignKey: 'courseTagId', as: 'tag' })

export default CuCourseTag
