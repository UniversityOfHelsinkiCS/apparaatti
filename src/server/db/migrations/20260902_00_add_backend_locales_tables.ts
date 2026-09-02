import { DataTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('backend_locale_keys', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  await queryInterface.createTable('backend_locale_values', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'backend_locale_keys',
        key: 'key',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    organisation_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primary_language: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primary_language_specification: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    text: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })

  await queryInterface.sequelize.query(`
    CREATE UNIQUE INDEX backend_locale_values_key_uniq
    ON backend_locale_values (
      key,
      COALESCE(organisation_code, '*'),
      COALESCE(lang, '*'),
      COALESCE(primary_language, '*'),
      COALESCE(primary_language_specification, '*')
    )
  `)

  await queryInterface.addIndex('backend_locale_values', ['key'], {
    name: 'backend_locale_values_key_idx',
  })

  await queryInterface.bulkInsert('backend_locale_keys', [
    {
      key: 'noRecommendations.additionalInfo',
      description: 'Kursseja ei löytynyt -näkymässä kuvaustekstin alla näytettävä lisäohje. Voi sisältää markdownia.',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ])
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('backend_locale_values')
  await queryInterface.dropTable('backend_locale_keys')
}
