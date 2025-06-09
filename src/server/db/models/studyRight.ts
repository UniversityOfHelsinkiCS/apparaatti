
import { Model, BIGINT, STRING, JSONB, DATE } from 'sequelize'
import { sequelize } from '../connection.ts'

class StudyRight extends Model {}

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
    admissionTypeUrn: {
      type: STRING
    },
    createdAt: {
      type: DATE
    },
    updatedAt: {
      type: DATE
    }
  },
  {
    underscored: true,
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
