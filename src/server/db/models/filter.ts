import { DataTypes, Model } from 'sequelize'
import { sequelize } from '../connection.ts'

export class Filter extends Model {}

Filter.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    effects: { type: DataTypes.STRING, allowNull: false },
    mandatory: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    type: { type: DataTypes.STRING, allowNull: false },
    shortName: { type: DataTypes.JSONB, allowNull: false },
    explanation: { type: DataTypes.JSONB, allowNull: true },
    extraInfo: { type: DataTypes.JSONB, allowNull: true },
    parentFilterId: { type: DataTypes.STRING, allowNull: true },
    displayOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    displayType: { type: DataTypes.STRING, allowNull: true },
    superToggle: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    hideInCurrentFiltersDisplay: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    hideInRecommendationReasons: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    hideInFilterSidebar: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    showInWelcomeModal: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    coordinateKey: { type: DataTypes.STRING, allowNull: true },
    isStrictByDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    variants: { type: DataTypes.JSONB, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Filter',
    tableName: 'filters',
    timestamps: true,
    underscored: true,
  }
)

export default Filter
