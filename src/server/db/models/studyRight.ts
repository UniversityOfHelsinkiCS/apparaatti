
import { Model } from 'sequelize'
import type {BIGINT, STRING, JSONB, DATE, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize'
import { sequelize } from '../connection.ts'

class StudyRight extends Model<
  InferAttributes<StudyRight>,
  InferCreationAttributes<StudyRight>
>  {
  declare autoId: CreationOptional<number>
  declare id: string
  declare personId: string
  declare state: string
  declare educationId: string
  declare organisationId: string
  declare modificationOrdinal: number
  declare documentState: string
  declare valid: object
  declare grantDate: Date
  declare studyStartDate: Date
  declare transferOutDate: Date
  declare termRegistrations: object
  declare studyRightCancellation: object
  declare studyRightGraduation: object
  declare snapshotDateTime: Date
  declare acceptedSelectionPath: object
  declare studyRightTransfer: object
  declare studyRightExtensions: object
  declare transferOutUniversityUrn: string
  declare requestedSelectionPath: object
  declare phase1MinorSelections: object
  declare phase2MinorSelections: object
  declare educationPhase1: CreationOptional<object>
  declare educationPhase2: CreationOptional<object>
  declare admissionTypeUrn: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

StudyRight.init(
  {
    autoId: {
      type: BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    id: {
      type: STRING
    },
    personId: {
      type: STRING
    },
    state: {
      type: STRING

    },
    educationId: {
      type: STRING
    },
    organisationId: {
      type: STRING
    },
    modificationOrdinal: {
      type: BIGINT
    },
    documentState: {
      type: STRING
    },
    valid: {
      type: JSONB
    },
    grantDate: {
      type: DATE
    },
    studyStartDate: {
      type: DATE
    },
    transferOutDate: {
      type: DATE
    },
    termRegistrations: {
      type: JSONB
    },
    studyRightCancellation: {
      type: JSONB
    },
    studyRightGraduation: {
      type: JSONB
    },
    snapshotDateTime: {
      type: DATE
    },
    acceptedSelectionPath: {
      type: JSONB
    },
    studyRightTransfer: {
      type: JSONB
    },
    studyRightExtensions: {
      type: JSONB
    },
    transferOutUniversityUrn: {
      type: STRING
    },
    requestedSelectionPath: {
      type: JSONB
    },
    phase1MinorSelections: {
      type: JSONB
    },
    phase2MinorSelections: {
      type: JSONB
    },
    educationPhase1: {
      type: JSONB
    },
    educationPhase2: {
      type: JSONB
    },
    admissionTypeUrn: {
      type: STRING
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    }
  },
  {
    underscored: true,
    timestamps: true,
    sequelize,
    modelName: 'studyright',
    tableName: 'studyrights',
    indexes: [
      {
        unique: true,
        fields: ['id', 'modification_ordinal']
      },
      {
        fields: ['id']
      },
      {
        fields: ['person_id']
      }
    ]
  }
)
export default StudyRight
