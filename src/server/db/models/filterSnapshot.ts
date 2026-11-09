import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'

export class FilterSnapshot extends Model {}

FilterSnapshot.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    payload: { type: DataTypes.JSONB, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'FilterSnapshot',
    tableName: 'filter_snapshots',
    timestamps: true,
    underscored: true,
  }
)

export default FilterSnapshot
