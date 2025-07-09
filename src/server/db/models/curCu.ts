import { Model, DataTypes } from 'sequelize'
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { sequelize } from '../connection.ts'
import Cu from './cu.ts'
import Cur from './cur.ts'

class CurCu extends Model<
  InferAttributes<CurCu>,
  InferCreationAttributes<CurCu>
> {
  declare id: CreationOptional<number>
  declare cuId: string
  declare curId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

CurCu.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cuId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Cu,
        key: 'id',
      },
    },
    curId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Cur,
        key: 'id',
      },
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
    indexes: [
      {
        name: 'cu_index',
        fields: ['cu_id']
      },
      {
        name: 'cur_index',
        fields: ['cur_id']
      }
    ],
    sequelize,
    modelName: 'CurCu',
    tableName: 'cur_cu',
    underscored: true, // Ensures database columns use snake_case
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
)
Cur.belongsToMany(Cu, { through: CurCu, foreignKey: 'cuId' })
Cu.belongsToMany(Cur, { through: CurCu, foreignKey: 'curId' })
export default CurCu
