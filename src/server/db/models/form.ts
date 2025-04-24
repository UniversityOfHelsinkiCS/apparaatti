import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../connection.ts'

export class Form extends Model {}

Form.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    courseRealisationId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Form',
    tableName: 'forms',
    timestamps: true,
    underscored: true,
  }
)
export default Form;