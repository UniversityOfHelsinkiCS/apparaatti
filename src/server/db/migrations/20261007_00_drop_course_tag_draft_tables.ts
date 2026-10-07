import { DataTypes, QueryTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

const DRAFT_PAYLOAD_SQL = `
  SELECT
    COALESCE((SELECT jsonb_agg(jsonb_build_object('key', t.key, 'description', t.description)) FROM course_tags t), '[]'::jsonb) AS tags,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('cuId', ct.cu_id, 'tagKey', t.key))
              FROM cu_course_tags ct JOIN course_tags t ON t.id = ct.course_tag_id), '[]'::jsonb) AS "cuTags",
    COALESCE((SELECT jsonb_agg(jsonb_build_object('curId', ct.cur_id, 'tagKey', t.key, 'mode', ct.mode))
              FROM cur_course_tags ct JOIN course_tags t ON t.id = ct.course_tag_id), '[]'::jsonb) AS "curTags"
`

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async transaction => {
    const [payload] = await queryInterface.sequelize.query<Record<string, unknown>>(DRAFT_PAYLOAD_SQL, {
      type: QueryTypes.SELECT,
      transaction,
    })

    await queryInterface.bulkInsert(
      'tag_snapshots',
      [
        {
          name: 'draft at migration',
          description: 'the shared server draft, saved as a version before drafts became local',
          created_by: null,
          payload: JSON.stringify({ exportedAt: new Date().toISOString(), ...payload }),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { transaction }
    )

    await queryInterface.dropTable('cur_course_tags', { transaction })
    await queryInterface.dropTable('cu_course_tags', { transaction })
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.createTable(
      'cu_course_tags',
      {
        id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
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
        created_at: { type: DataTypes.DATE, allowNull: false },
        updated_at: { type: DataTypes.DATE, allowNull: false },
      },
      { transaction }
    )

    await queryInterface.createTable(
      'cur_course_tags',
      {
        id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
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
        mode: { type: DataTypes.STRING, allowNull: false },
        created_at: { type: DataTypes.DATE, allowNull: false },
        updated_at: { type: DataTypes.DATE, allowNull: false },
      },
      { transaction }
    )

    await queryInterface.addIndex('cu_course_tags', ['cu_id', 'course_tag_id'], {
      name: 'cu_course_tags_uniq',
      unique: true,
      transaction,
    })
    await queryInterface.addIndex('cur_course_tags', ['cur_id', 'course_tag_id'], {
      name: 'cur_course_tags_uniq',
      unique: true,
      transaction,
    })
  })
}
