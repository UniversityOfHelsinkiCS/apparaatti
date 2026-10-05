import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'
import CourseTag from './courseTag.ts'
import Cur from './cur.ts'

export class CurCourseTag extends Model {}

CurCourseTag.init(
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
    modelName: 'CurCourseTag',
    tableName: 'cur_course_tags',
    timestamps: true,
    underscored: true,
  }
)

Cur.hasMany(CurCourseTag, { foreignKey: 'curId', as: 'tagRows' })
CurCourseTag.belongsTo(Cur, { foreignKey: 'curId', as: 'cur' })
CurCourseTag.belongsTo(CourseTag, { foreignKey: 'courseTagId', as: 'tag' })

export default CurCourseTag
