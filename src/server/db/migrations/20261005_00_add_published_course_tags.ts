import { DataTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.createTable(
      'published_cu_course_tags',
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

    await queryInterface.addIndex('published_cu_course_tags', ['cu_id', 'course_tag_id'], {
      name: 'published_cu_course_tags_uniq',
      unique: true,
      transaction,
    })

    await queryInterface.createTable(
      'published_cur_course_tags',
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

    await queryInterface.addIndex('published_cur_course_tags', ['cur_id', 'course_tag_id'], {
      name: 'published_cur_course_tags_uniq',
      unique: true,
      transaction,
    })
    await queryInterface.addIndex('published_cur_course_tags', ['cur_id'], {
      name: 'published_cur_course_tags_cur_idx',
      transaction,
    })

    await queryInterface.sequelize.query(
      `INSERT INTO published_cu_course_tags (cu_id, course_tag_id, created_at, updated_at)
       SELECT cu_id, course_tag_id, now(), now() FROM cu_course_tags`,
      { transaction }
    )
    await queryInterface.sequelize.query(
      `INSERT INTO published_cur_course_tags (cur_id, course_tag_id, mode, created_at, updated_at)
       SELECT cur_id, course_tag_id, mode, now(), now() FROM cur_course_tags`,
      { transaction }
    )
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('published_cur_course_tags')
  await queryInterface.dropTable('published_cu_course_tags')
}
