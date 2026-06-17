import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'
class UserVisits extends Model<InferAttributes<UserVisits>, InferCreationAttributes<UserVisits>> {
  declare id: CreationOptional<number> // sequelize breaks if the table entries wont have an id
  declare visitorHashHex: string // one way hash of user id
  declare date: Date
}

UserVisits.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    visitorHashHex: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE, // in utc
      allowNull: false,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
  }
)

export default UserVisits
