import { DataTypes } from 'sequelize'

import { type Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('cur_cu', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cu_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'cu',
        key: 'id',
      },
    },
    cur_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'cur',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('cur_cu')
}
