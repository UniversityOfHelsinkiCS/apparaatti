import logger from '../util/logger.ts'
import { fetchData } from './importerClient.ts'
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
  if (Date.now() - start > 7_200_000)
    throw new Error('Updater time limit exceeded!')
  return true
}
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

/**
 * mangle === mangel === mankeloida in Finnish. Usually means 'to do some heavy processing on data to transform it into another format'.
 *
 * In this case, it also means 'to fetch data from API in batches, process them, and produce logs about the progress'
 * @param {string} url the Importer palaute endpoint to call
 * @param {number} limit number of entities in one batch
 * @param {(data: object[]) => Promise<void>} handler handler function to mangel and store entities in db
 * @param {Date} since date since the data is to be fetched
 */
export const mangleData = async <T = object>(
  url: string,
  limit: number,
  handler: (data: T[]) => Promise<void>,
  since: Date = null
) => {
  console.log('Updater started with base url of ', IMPORTER_URL)
  logger.info(`[UPDATER] Starting to update items with url ${url}`)
  const offsetKey = `${url}-offset`
  const start = Date.now()
  let requestStart = null
  let loopStart = Date.now()

  let offset = Number(await redis.get(offsetKey))
  let count = 0
  let currentData = null
  let nextData = null
  /**
   * Async loop:
   * 1. Wait for the data being fetched. Initially null so no wait
   * 2. Start fetching the next data but don't wait
   * 3. Process the currently available data. Meanwhile the next data is being fetched
   *
   * This way Importer, which is comparatively slower, will be constantly working on one request.
   */

  while (checkTimeout(start)) {
    try {

      try {
        currentData = await nextData
      } catch (e: any) {
        logError('Updaterloop fetch error:', e)
        e.isLogged = true
        throw e
      }

      if (currentData?.length === 0) break

      const requestTime = (Date.now() - requestStart).toFixed(0)
      requestStart = Date.now()

      try{
        nextData = fetchData<T[]>(url, { limit, offset, since })
      }
      catch(e){
        console.log('fetch failed')
        console.log(e)
        await sleep(1000) //the fail might be server stall so lets give it some time
        continue 
      }
      if (!currentData) continue // first iteration

      const processingStart = Date.now()

      try {
        await handler(currentData)
        await redis.set(offsetKey, offset)
      } catch (e: any) {
        logError('Updaterloop handler error:', e)
        e.isLogged = true
        errorSleep = true
        throw e
      }

      const processingTime = (Date.now() - processingStart).toFixed(0)
      const totalTime = (Date.now() - loopStart).toFixed(0)
      loopStart = Date.now()
      logger.debug('[UPDATERLOOP]', {
        url,
        offset,
        items: currentData.length,
        requestTime,
        processingTime,
        totalTime,
      })

      count += currentData.length
      offset += limit
    } catch (e: any) {
      if (!e.isLogged) {
        logError('Unknown updaterloop error:', e)
      }
    }
  }

  const duration = Date.now() - start
  logger.info(
    `[UPDATER] Updated ${count} items at ${(duration / count).toFixed(
      4
    )}ms/item, total time ${(duration / 1000).toFixed(2)}s`
  )
  await sleep(100)
}
