import * as Sentry from '@sentry/node'

import { redis } from '../util/redis.ts'
import logger from '../util/logger.ts'
import { PartialRecord } from './types.ts'

const logError = (message: string, error: Error) => {
  logger.error(`${message} ${error.name}, ${error.message}`)

  Sentry.captureException(error)
}

type AllowedBulkCreateOptionField =
  | 'conflictAttributes'
  | 'updateOnDuplicate'
  | 'ignoreDuplicates'
type AllowedFallbackCreateOptionField = 'fields' | 'conflictFields'

interface BulkCreateOptions {
  entityName: string
  bulkCreate: (entities: object[], options: any) => Promise<any>
  fallbackCreate: (entity: object, options: any) => Promise<any>
  bulkCreateOptions: PartialRecord<AllowedBulkCreateOptionField, any>
  fallbackCreateOptions: PartialRecord<AllowedFallbackCreateOptionField, any>
  entities: Record<string, any>[]
}
export const safeBulkCreate = async ({
  entityName,
  bulkCreate,
  fallbackCreate,
  bulkCreateOptions,
  fallbackCreateOptions,
  entities,
}: BulkCreateOptions) => {
  try {
    const result = await bulkCreate(entities, bulkCreateOptions)
    return result
  } catch (bulkCreateError: any) {
    const result = []
    logError(
      `[UPDATER] ${entityName}.bulkCreate failed, reason: `,
      bulkCreateError
    )
    logger.info(`[UPDATER] Creating ${entityName}s one by one`)
    for (const entity of entities) {
      try {
        const res = await fallbackCreate(entity, fallbackCreateOptions)
        result.push(res)
      } catch (fallbackCreateError: any) {
        logError(
          `[UPDATER] Fallback could not create ${entityName} (${JSON.stringify(
            entity
          )}), reason:`,
          fallbackCreateError
        )
      }
    }
    return result
  }
}

export const clearOffsets = async () => {
  const keys = await redis.keys('*-offset')

  for (const key of keys) {
    await redis.del(key)
  }
}
