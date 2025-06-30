import { Model, DataTypes } from 'sequelize'
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../connection.ts'
import type { LocalizedString } from '../../../common/types.ts'
class Cur extends Model<InferAttributes<Cur>, InferCreationAttributes<Cur>> {
  declare id: string
  declare name: LocalizedString
  declare startDate: Date
  declare endDate: Date
  declare customCodeUrns: JSON
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

Cur.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    customCodeUrns: {
      type: DataTypes.JSONB
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
    modelName: 'Cur',
    tableName: 'curs',
    underscored: true, // Ensures database columns use snake_case
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
)

export default Cur
