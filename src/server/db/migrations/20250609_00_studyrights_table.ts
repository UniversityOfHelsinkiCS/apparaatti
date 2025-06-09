import { DataTypes, JSONB } from 'sequelize'
import { sequelize, type Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {  
  await queryInterface.createTable('studyrights', {
    auto_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    person_id: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    education_id: {
      type: DataTypes.STRING,
    },
    organisation_id: {
      type: DataTypes.STRING,
    },
    modification_ordinal: {
      type: DataTypes.BIGINT,
    },
    document_state: {
      type: DataTypes.STRING,
    },
    valid: {
      type: JSONB,
    },
    grant_date: {
      type: DataTypes.DATE,
    },
    study_start_date: {
      type: DataTypes.DATE,
    },
    transfer_out_date: {
      type: DataTypes.DATE,
    },
    term_registrations: {
      type: JSONB,
    },
    study_right_cancellation: {
      type: JSONB,
    },
    study_right_graduation: {
      type: JSONB,
    },
    snapshot_date_time: {
      type: DataTypes.DATE,
    },
    accepted_selection_path: {
      type: JSONB,
    },
    study_right_transfer: {
      type: JSONB,
    },
    study_right_extensions: {
      type: JSONB,
    },
    transfer_out_university_urn: {
      type: DataTypes.STRING,
    },
    requested_selection_path: {
      type: JSONB,
    },
    phase1_minor_selections: {
      type: JSONB,
    },
    phase2_minor_selections: {
      type: JSONB,
    },
    admission_type_urn: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  })

  await queryInterface.addIndex('studyrights', {
    unique: true,
    fields: ['id', 'modification_ordinal'],
  })

  await queryInterface.addIndex('studyrights', ['id'])
  await queryInterface.addIndex('studyrights', ['person_id'])
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('studyrights')
}
