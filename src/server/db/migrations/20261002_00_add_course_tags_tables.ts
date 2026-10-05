import { DataTypes } from 'sequelize'

import type { Migration } from '../connection.ts'
import { seedCourseTags } from '../seedCourseTags.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.createTable(
      'course_tags',
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        key: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
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
      },
      { transaction }
    )

    await queryInterface.addIndex('course_tags', ['key'], {
      name: 'course_tags_key_uniq',
      unique: true,
      transaction,
    })

    await queryInterface.createTable(
      'cu_course_tags',
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        cu_id: {
          type: DataTypes.STRING,
          allowNull: false,
          references: { model: 'cus', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        course_tag_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'course_tags', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      { transaction }
    )

    await queryInterface.addIndex('cu_course_tags', ['cu_id', 'course_tag_id'], {
      name: 'cu_course_tags_uniq',
      unique: true,
      transaction,
    })
    await queryInterface.addIndex('cu_course_tags', ['course_tag_id'], {
      name: 'cu_course_tags_tag_idx',
      transaction,
    })

    await queryInterface.createTable(
      'cur_course_tags',
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        cur_id: {
          type: DataTypes.STRING,
          allowNull: false,
          references: { model: 'curs', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        course_tag_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'course_tags', key: 'id' },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        mode: {
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
      },
      { transaction }
    )

    await queryInterface.addIndex('cur_course_tags', ['cur_id', 'course_tag_id'], {
      name: 'cur_course_tags_uniq',
      unique: true,
      transaction,
    })
    await queryInterface.addIndex('cur_course_tags', ['cur_id'], { name: 'cur_course_tags_cur_idx', transaction })
    await queryInterface.addIndex('cur_course_tags', ['course_tag_id'], {
      name: 'cur_course_tags_tag_idx',
      transaction,
    })

    await queryInterface.createTable(
      'tag_snapshots',
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        payload: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        created_by: {
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
      },
      { transaction }
    )

    await queryInterface.addIndex('tag_snapshots', ['created_at'], {
      name: 'tag_snapshots_created_at_idx',
      transaction,
    })

    await seedCourseTags(transaction)
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('tag_snapshots')
  await queryInterface.dropTable('cur_course_tags')
  await queryInterface.dropTable('cu_course_tags')
  await queryInterface.dropTable('course_tags')
}
