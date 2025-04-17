import Redis from 'ioredis'

import { REDIS_HOST } from './config.ts'

export const redis = new Redis({
  host: REDIS_HOST,
  port: 6379,
})

export const set = async (key: string, value: any) => {
  const ttl = 60 * 60
  await redis.set(key, JSON.stringify(value), 'EX', ttl)
}

export const get = async (key: string): Promise<any | null> => {
  const value = await redis.get(key)

  if (!value) return null

  return JSON.parse(value)
}
