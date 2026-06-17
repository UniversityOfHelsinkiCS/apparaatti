import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'
import Cur from './cur.ts'

//why is this not in cur?
//Cur represents what is in sisu and this is seperate from sisu so it will be kept seperate.
class CourseAdminReview extends Model<InferAttributes<CourseAdminReview>, InferCreationAttributes<CourseAdminReview>> {
  declare id: CreationOptional<number>
  declare curId: string
  declare reviewed: string // possible states: 'no' and 'yes', reason behind being a string is that in the future more states wil be wanted like 'changed' or 'todo'
  declare comment: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

CourseAdminReview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    curId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Cur,
        key: 'id',
      },
    },
    reviewed: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'no',
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'CourseAdminReview',
    tableName: 'course_admin_reviews',
    underscored: true, // Ensures database columns use snake_case
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
)
Cur.hasMany(CourseAdminReview, { foreignKey: 'curId', as: 'adminReview' })
CourseAdminReview.belongsTo(Cur, { foreignKey: 'curId', as: 'cur' })
export default CourseAdminReview
