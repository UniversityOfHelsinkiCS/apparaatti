import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../db/connection.ts';

class CurCu extends Model<
  InferAttributes<CurCu>,
  InferCreationAttributes<CurCu>
> {
  declare id: CreationOptional<number>;
  declare cuId: string;
  declare curId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
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
    },
    curId: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'CurCu',
    tableName: 'cur_cu',
    underscored: true, // Ensures database columns use snake_case
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export default CurCu;