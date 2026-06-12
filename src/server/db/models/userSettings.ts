import { DataTypes, Model } from 'sequelize'
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { sequelize } from '../connection.ts'
import User from './user.ts'

class UserSettings extends Model<InferAttributes<UserSettings>, InferCreationAttributes<UserSettings>> {
  declare id: CreationOptional<number>
  declare userId: string
  declare educationLanguage: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

UserSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    educationLanguage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      unique: true,
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
    tableName: 'user_settings',
    underscored: true,
    timestamps: true,
  }
)

User.hasOne(UserSettings, { as: 'userSettings', foreignKey: 'userId' })
UserSettings.belongsTo(User, { foreignKey: 'userId', as: 'user' })
export default UserSettings
