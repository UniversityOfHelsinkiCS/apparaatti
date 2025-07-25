import { Sequelize } from 'sequelize'
import { Umzug, SequelizeStorage } from 'umzug'

import logger from '../util/logger.ts'
import { DATABASE_URL } from '../util/config.ts'

const DB_CONNECTION_RETRY_LIMIT = 10

if (DATABASE_URL === '') {
  console.log('database url not set!')
}

export const sequelize = new Sequelize(DATABASE_URL, { logging: false })

const umzug = new Umzug({
  migrations: { glob: 'src/server/db/migrations/*.ts' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
})

export type Migration = typeof umzug._types.migration

const runMigrations = async () => {
  await umzug.up()
  logger.info('Migrations up to date')
}

const testConnection = async () => {
  await sequelize.authenticate()
  await runMigrations()
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const connectToDatabase = async (attempt = 0): Promise<void | null> => {
  try {
    await testConnection()
    console.log('connected to db')
  } catch (err: any) {
    console.log('ran into an error')
    console.log(err)
    if (attempt === DB_CONNECTION_RETRY_LIMIT) {
      logger.error(`Connection to database failed after ${attempt} attempts`, {
        error: err.stack,
      })

      return process.exit(1)
    }
    logger.info(
      `Connection to database failed! Attempt ${attempt} of ${DB_CONNECTION_RETRY_LIMIT}`
    )
    logger.error('Database error: ', err)
    await sleep(5000)

    return connectToDatabase(attempt + 1)
  }

  return null
}
