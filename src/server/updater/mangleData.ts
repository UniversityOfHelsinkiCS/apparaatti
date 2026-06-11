import logger from '../util/logger.ts'
import { fetchData, importerClient } from './importerClient.ts'
import * as redis from '../util/redis.ts'
import { IMPORTER_URL } from '../util/config.ts'

const logError = (message: string, error: Error) => {
  logger.error(`[UPDATER] ${message} ${error.name}, ${error.message}`)
}

/**
 * If a single update category takes over two hours, something is probably wrong
 * Stop Updater from running indefinitely
 */
const checkTimeout = (start: number) => {
  if (Date.now() - start > 7_200_000) throw new Error('Updater time limit exceeded!')
  return true
}
//assumes that the endpoint is at the normal url + /count
const fetchMaxRecordCount = async (url: string) => {
  const data = await fetchData(`${url}/count`, {})
  return data
}
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

export const mangleData = async (url: string, limit: number, handler: any, since: Date = null) => {
  logger.info(`[UPDATER] Starting to update items with url ${url}`)
  const maxRecords = Number(await fetchMaxRecordCount(url))
  console.log('expecting max entiries of: ')
  console.log(maxRecords)

  const maxRetries = 3
  let retries = 0

  const errorSleepTime = 30 * 1000 //30s
  const loopSleepTime = 1000 //1s

  const maxIterations = Math.ceil(maxRecords / limit) + 1
  console.log(`max iterations is ${maxIterations}`)

  if (maxIterations > 500) {
    console.log(`WARNING attempting to do a large amount of requests to ${url} consider to adjust limit`)
  }

  const offsetKey = `${url}-offset`
  const start = Date.now()

  let requestStart = null
  let loopStart = Date.now()
  let offset = Number(await redis.get(offsetKey))
  let count = 0
  let iterations = 0

  while (iterations < maxIterations) {
    await sleep(loopSleepTime) //one second for debug //the importer is slower than the updater, so slow the updater to one request every 200ms
    const requestTime = (Date.now() - requestStart).toFixed(0)
    requestStart = Date.now()

    let currentData = null
    try {
      logger.info('[UPDATER] getting data')
      currentData = await fetchData(url, { limit, offset, since })
    } catch (e) {
      console.log(e)
      console.log(`FATAL error on updater ${e}, offset ${offset}`)
      break
    }

    if (!currentData) {
      if (retries < maxRetries) {
        retries += 1
        await sleep(errorSleepTime)
        continue
      }

      logger.info('[UPDATER] updater failed to get any more data')
      break
    }

    logger.info('[UPDATER] got data')
    console.log(`entering saving data ${url} ${offset} `)
    const processingStart = Date.now()

    try {
      await handler(currentData)
      await redis.set(offsetKey, offset)
    } catch (e: any) {
      console.log(`FATAL error on updater handler ${e}, offset ${offset}`)
      logError('Updaterloop handler error:', e)
      e.isLogged = true
      break
    }

    logger.info('[UPDATER] saved data')
    console.log('saved the data')
    const processingTime = (Date.now() - processingStart).toFixed(0)
    const totalTime = (Date.now() - loopStart).toFixed(0)
    loopStart = Date.now()
    logger.debug('[UPDATERLOOP]', {
      url,
      offset,
      items: currentData?.length,
      requestTime,
      processingTime,
      totalTime,
    })

    count += currentData?.length
    offset += limit

    const duration = Date.now() - start
    logger.info(
      `[UPDATER] Updated ${count} items at ${(duration / count).toFixed(
        4
      )}ms/item, total time ${(duration / 1000).toFixed(2)}s`
    )

    console.log('one round of mankeli done')
    console.log(offset)
    iterations += 1
  }
  console.log('mankeloi is done')
}
