import type { Transaction } from 'sequelize'

import logger from '../util/logger.ts'
import { sequelize } from './connection.ts'
import { COURSE_TAG_SEEDS } from './courseTagSeeds.ts'
import CourseTag from './models/courseTag.ts'
import CurCourseTag from './models/curCourseTag.ts'

const BACKFILL_SQL = `
  INSERT INTO cur_course_tags (cur_id, course_tag_id, mode, created_at, updated_at)
  SELECT c.id, t.id, 'add', now(), now()
  FROM curs c
  CROSS JOIN LATERAL jsonb_each(COALESCE(c.custom_code_urns, '{}'::jsonb)) AS e(k, v)
  CROSS JOIN LATERAL jsonb_array_elements_text(v) AS u(urn)
  JOIN course_tags t ON u.urn LIKE '%' || t.key || '%'
  WHERE e.k LIKE '%kk-apparaatti%'
  ON CONFLICT (cur_id, course_tag_id) DO NOTHING
`

export async function seedCourseTags(transaction?: Transaction) {
  logger.info('Seeding course tags...')
  const existing = await CourseTag.count({ transaction })
  if (existing > 0) {
    logger.info(`Course tags table already has ${existing} rows, skipping seed`)
    return
  }

  await CourseTag.bulkCreate(COURSE_TAG_SEEDS as any, { ignoreDuplicates: true, transaction })
  await sequelize.query(BACKFILL_SQL, { transaction })
  const inserted = await CurCourseTag.count({ transaction })
  logger.info(`Seeded ${COURSE_TAG_SEEDS.length} course tags and backfilled ${inserted} cur tag rows`)
}
