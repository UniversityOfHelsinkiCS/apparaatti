import { DataTypes } from 'sequelize'

import type { Migration } from '../connection.ts'

const SEED_TAGS: { key: string; description: string }[] = [
  { key: 'kks-kor', description: 'Korvaava: kurssi korvaa pakollisen kieliopintojakson' },
  { key: 'kks-pre', description: 'Valmentava: kurssi valmentaa pakolliseen kieliopintojaksoon' },
  { key: 'kks-muk', description: 'Mukautettu: kurssi on suunnattu erityistä tukea tarvitseville' },
  { key: 'kks-val', description: 'Valmistuville: kurssi sopii valmistumisvaiheen opiskelijalle' },
  { key: 'kks-int', description: 'Integroitu: kieliopinto on integroitu aineopintoihin' },
  { key: 'kks-jou', description: 'Joustava: kurssi on suoritettavissa joustavasti' },
  { key: 'kks-raj', description: 'Rajattu: kurssia ei suositella avoimesti, jätetään suosituksista pois' },
  { key: 'kks-alm', description: 'Almanakka: kurssi näkyy lukuvuosisuunnittelussa' },
  { key: 'kks-mat', description: 'Matemaattis-luonnontieteellinen kohdennus' },
  { key: 'opintotarjonta:mooc', description: 'MOOC: avoin verkkokurssi' },
  { key: 'kkt-hum', description: 'Humanistinen tiedekunta' },
  { key: 'kkt-mat', description: 'Matemaattis-luonnontieteellinen tiedekunta' },
  { key: 'kkt-oik', description: 'Oikeustieteellinen tiedekunta' },
  { key: 'kkt-teo', description: 'Teologinen tiedekunta' },
  { key: 'kkt-ssk', description: 'Valtiotieteellinen tiedekunta, sosiaalitieteet' },
  { key: 'kkt-val', description: 'Valtiotieteellinen tiedekunta' },
  { key: 'kkt-ela', description: 'Eläinlääketieteellinen tiedekunta' },
  { key: 'kkt-kas', description: 'Kasvatustieteellinen tiedekunta' },
  { key: 'kkt-bio', description: 'Bio- ja ympäristötieteellinen tiedekunta' },
  { key: 'kkt-mm', description: 'Maatalous-metsätieteellinen tiedekunta' },
  { key: 'kkt-sps', description: 'Soveltava psykologia' },
  { key: 'kkt-ham', description: 'Humanistinen tiedekunta, Helsingin alue' },
  { key: 'kkt-laa', description: 'Lääketieteellinen tiedekunta' },
  { key: 'kkt-log', description: 'Logopedia' },
  { key: 'kkt-psy', description: 'Psykologia' },
  { key: 'kkt-far', description: 'Farmasian tiedekunta' },
]

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

    const now = new Date()

    await queryInterface.bulkInsert(
      'course_tags',
      SEED_TAGS.map(tag => ({ key: tag.key, description: tag.description, created_at: now, updated_at: now })),
      { transaction }
    )

    const tags = (await queryInterface.select(null, 'course_tags', { where: {}, transaction })) as {
      id: number
      key: string
    }[]

    const curs = (await queryInterface.select(null, 'curs', { where: {}, transaction })) as {
      id: string
      custom_code_urns: Record<string, string[]> | null
    }[]

    const tagRows: Record<string, unknown>[] = []
    const seen = new Set<string>()

    for (const cur of curs) {
      for (const urns of Object.values(cur.custom_code_urns ?? {})) {
        for (const urn of urns) {
          const tag = tags.find(candidate => urn === candidate.key || urn.endsWith(`:${candidate.key}`))
          if (!tag || seen.has(`${cur.id}::${tag.id}`)) continue
          seen.add(`${cur.id}::${tag.id}`)
          tagRows.push({ cur_id: cur.id, course_tag_id: tag.id, mode: 'add', created_at: now, updated_at: now })
        }
      }
    }

    if (tagRows.length > 0) {
      await queryInterface.bulkInsert('cur_course_tags', tagRows, { transaction })
    }
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('tag_snapshots')
  await queryInterface.dropTable('cur_course_tags')
  await queryInterface.dropTable('cu_course_tags')
  await queryInterface.dropTable('course_tags')
}
