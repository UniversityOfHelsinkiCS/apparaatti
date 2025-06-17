import { DataTypes, Sequelize } from 'sequelize'
import { Migration } from '../connection'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('organisations', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.JSONB,
    },
    code: {
      type: DataTypes.STRING,
    },
    parent_id: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  })
}

export const down: Migration = async ({ context: queryInterface }) =>  {
  await queryInterface.dropTable('organisations')
}
