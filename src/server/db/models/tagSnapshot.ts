import { DataTypes, Model } from 'sequelize'

import { sequelize } from '../connection.ts'

export class TagSnapshot extends Model {}

TagSnapshot.init(
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
    createdBy: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'TagSnapshot',
    tableName: 'tag_snapshots',
    timestamps: true,
    underscored: true,
  }
)

export default TagSnapshot
