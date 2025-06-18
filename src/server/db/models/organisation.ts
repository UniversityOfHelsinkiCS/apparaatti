import { DataTypes, Model } from 'sequelize'
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../connection.ts'

/**
 * Organisation is for example:
 *  Matemaattisluonnontieteellinen H50
 *
 * A studyright refences An organisation using organisation id
 *
 */

class Organisation extends Model<
  InferAttributes<Organisation>,
  InferCreationAttributes<Organisation>
> {
  declare id: CreationOptional<number>
  declare name: object
  declare code: string
  declare parentId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Organisation.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.JSONB,
    },
    code: {
      type: DataTypes.STRING,
    },
    parentId: {
      type: DataTypes.STRING,
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
    underscored: true,
    timestamps: true,
    sequelize,
    modelName: 'Form',
    tableName: 'forms',
  }
)

export default Organisation
