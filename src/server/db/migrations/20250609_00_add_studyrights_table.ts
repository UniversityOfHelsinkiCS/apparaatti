import { DataTypes, JSONB } from 'sequelize'
import { sequelize, type Migration } from '../connection.ts'


export const up: Migration = async ({ context: queryInterface }) => {  
  await queryInterface.createTable('studyrights', {
    autoId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    personId: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    educationId: {
      type: DataTypes.STRING,
    },
    organisationId: {
      type: DataTypes.STRING,
    },
    modificationOrdinal: {
      type: DataTypes.BIGINT,
    },
    documentState: {
      type: DataTypes.STRING,
    },
    valid: {
      type: JSONB,
    },
    grantDate: {
      type: DataTypes.DATE,
    },
    studyStartDate: {
      type: DataTypes.DATE,
    },
    transferOutDate: {
      type: DataTypes.DATE,
    },
    termRegistrations: {
      type: JSONB,
    },
    studyRightCancellation: {
      type: JSONB,
    },
    studyRightGraduation: {
      type: JSONB,
    },
    snapshotDateTime: {
      type: DataTypes.DATE,
    },
    acceptedSelectionPath: {
      type: JSONB,
    },
    studyRightTransfer: {
      type: JSONB,
    },
    studyRightExtensions: {
      type: JSONB,
    },
    transferOutUniversityUrn: {
      type: DataTypes.STRING,
    },
    requestedSelectionPath: {
      type: JSONB,
    },
    phase1MinorSelections: {
      type: JSONB,
    },
    phase2MinorSelections: {
      type: JSONB,
    },
    admissionTypeUrn: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  })

  await queryInterface.addIndex('studyrights', {
    unique: true,
    fields: ['id', 'modificationOrdinal'],
  })

  await queryInterface.addIndex('studyrights', ['id'])
  await queryInterface.addIndex('studyrights', ['personId'])
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('studyrights')
}
