import { Model, DataTypes } from 'sequelize';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../connection.ts';

class Enrolment extends Model<
    InferAttributes<Enrolment>,
    InferCreationAttributes<Enrolment>
> {
    declare id: CreationOptional<number>;
    declare userId: string;
    declare courseRealisationId: string;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Enrolment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseRealisationId: {
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
    modelName: 'Enrolment',
    tableName: 'enrolments',
    underscored: true, // Ensures database columns use snake_case
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export default Enrolment;