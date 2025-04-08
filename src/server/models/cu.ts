import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../db/connection';
import { LocalizedString } from '../../common/types';

class Cu extends Model<
  InferAttributes<Cu>,
  InferCreationAttributes<Cu>
> {
  declare id: string;
  declare name: LocalizedString;
  declare courseCode: string;
  declare groupId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Cu.init(
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
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    groupId: {
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
    modelName: 'Cu',
    tableName: 'cus',
    underscored: true,
    timestamps: true,
  }
);

export default Cu;