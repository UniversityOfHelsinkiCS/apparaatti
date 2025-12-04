import { DataTypes, Model } from 'sequelize'
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../connection.ts'
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string
  declare username: string
  declare firstName: CreationOptional<string>
  declare lastName: CreationOptional<string>
  declare hyGroupCn: CreationOptional<string[]>
  declare language?: CreationOptional<string>
  declare studentNumber: CreationOptional<string>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstNames: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
     hyGroupCn: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
    },
    studentNumber: {
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
    tableName: 'users',
    underscored: true,
    timestamps: true,
  }
)

export default User
