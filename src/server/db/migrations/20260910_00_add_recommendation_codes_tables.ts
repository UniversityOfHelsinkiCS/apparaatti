import { DataTypes } from 'sequelize'

import type { Migration } from '../connection.ts'
import { seedRecommendationCodes } from '../seedRecommendationCodes.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('recommendation_languages', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    lang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    primary_language_specification: {
      type: DataTypes.STRING,
      allowNull: true,
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
    CREATE UNIQUE INDEX recommendation_languages_uniq
    ON recommendation_languages (
      lang,
      COALESCE(language_type, '*'),
      COALESCE(primary_language_specification, '*')
    )
  `)

  await queryInterface.createTable('recommendation_codes', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    organisation_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'recommendation_languages',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
    course_code: {
      type: DataTypes.STRING,
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

  await queryInterface.addIndex('recommendation_codes', ['organisation_code', 'language_id', 'course_code'], {
    name: 'recommendation_codes_uniq',
    unique: true,
  })

  await seedRecommendationCodes()
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('recommendation_codes')
  await queryInterface.dropTable('recommendation_languages')
}
