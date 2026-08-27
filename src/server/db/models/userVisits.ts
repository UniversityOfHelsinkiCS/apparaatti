import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { DataTypes, Model } from 'sequelize'

import type { LocalizedString } from '../../../common/types.ts'
import { sequelize } from '../connection.ts'
class UserVisits extends Model<InferAttributes<UserVisits>, InferCreationAttributes<UserVisits>> {
  declare id: CreationOptional<number> // sequelize breaks if the table entries wont have an id
  declare visitorHashHex: string // one way hash of user id
  declare date: Date
  declare organisationCode: CreationOptional<string | null>
  declare phase1ProgrammeCode: CreationOptional<string | null>
  declare phase1ProgrammeName: CreationOptional<LocalizedString | null>
  declare phase2ProgrammeCode: CreationOptional<string | null>
  declare phase2ProgrammeName: CreationOptional<LocalizedString | null>
}

UserVisits.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    visitorHashHex: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE, // in utc
      allowNull: false,
    },
    organisationCode: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    phase1ProgrammeCode: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    phase1ProgrammeName: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    phase2ProgrammeCode: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    phase2ProgrammeName: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    underscored: true,
    timestamps: false,
  }
)

export default UserVisits
