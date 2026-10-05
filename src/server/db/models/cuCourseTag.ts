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
  }
)

Cu.hasMany(CuCourseTag, { foreignKey: 'cuId', as: 'tagRows' })
CuCourseTag.belongsTo(Cu, { foreignKey: 'cuId', as: 'cu' })
CuCourseTag.belongsTo(CourseTag, { foreignKey: 'courseTagId', as: 'tag' })

export default CuCourseTag
