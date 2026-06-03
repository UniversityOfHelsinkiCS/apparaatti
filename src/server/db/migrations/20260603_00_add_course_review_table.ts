import { DataTypes, JSONB } from 'sequelize'

import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('course_admin_reviews', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cur_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'curs',
        key: 'id',
      },
    },
    reviewed: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'no',
    },
    comment: {
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
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('course_admin_reviews')
}
