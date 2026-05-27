import { DataTypes, Model } from 'sequelize'
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../connection.ts'

class UserFeedback extends Model<InferAttributes<UserFeedback>, InferCreationAttributes<UserFeedback>> {
  declare id: CreationOptional<number>
  declare textFeedback: string
  declare stars: number
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
