import { DataTypes, Model } from 'sequelize'
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../connection.ts'
class UserVisits extends Model<InferAttributes<UserVisits>, InferCreationAttributes<UserVisits>>{
    declare visitorHashHex: string // one way hash of user id
    declare date: Date
}

UserVisits.init(
    {
        visitorHashHex: {
            type: DataTypes.STRING, 
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        underscored: true,
    }
)

export default UserVisits