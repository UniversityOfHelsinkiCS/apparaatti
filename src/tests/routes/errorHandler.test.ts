import type { NextFunction, Request, Response } from 'express'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import errorHandler from '../../server/middleware/errorHandler.ts'

vi.mock('../../server/util/logger.ts', () => ({ default: { error: vi.fn() } }))

const responseSpy = () => {
  const sent: { status?: number; body?: any } = {}

  const res = {
    headersSent: false,
    status(code: number) {
      sent.status = code
      return res
    },
    json(body: any) {
      sent.body = body
      return res
    },
  }

  return { res: res as unknown as Response, sent }
}

const request = { method: 'POST', path: '/api/feedback' } as Request

const zodErrorOf = (body: unknown) => {
  const schema = z.object({ stars: z.number().int() })
  const parsed = schema.safeParse(body)

  return parsed.success ? null : parsed.error
}

describe('errorHandler', () => {
  it('turns a schema failure into a 400 that names the offending field', () => {
    const { res, sent } = responseSpy()

    errorHandler(zodErrorOf({ stars: 'five' }), request, res, vi.fn())

    expect(sent.status).toBe(400)
    expect(sent.body.message).toBe('Invalid input')
    expect(sent.body.errors.fieldErrors.stars).toBeTruthy()
  })

  it('answers any other failure with a 500 that carries neither the message nor the stack', () => {
    const { res, sent } = responseSpy()
    const leaky = new Error('connect ECONNREFUSED 10.1.2.3:5432 as user apparaatti_admin')

    errorHandler(leaky, request, res, vi.fn())

    expect(sent.status).toBe(500)
    expect(sent.body).toEqual({ message: 'Internal server error' })

    const serialized = JSON.stringify(sent.body)
    expect(serialized).not.toContain('ECONNREFUSED')
    expect(serialized).not.toContain('apparaatti_admin')
    expect(serialized).not.toContain('errorHandler.test')
  })

  it('reports a thrown non-error without crashing on it', () => {
    const { res, sent } = responseSpy()

    errorHandler('database exploded', request, res, vi.fn())

    expect(sent.status).toBe(500)
    expect(sent.body).toEqual({ message: 'Internal server error' })
  })

  it('hands a failure that arrives mid-response back to express instead of writing twice', () => {
    const { res, sent } = responseSpy()
    const next = vi.fn() as unknown as NextFunction
    const streamed = new Error('socket closed')
    ;(res as { headersSent: boolean }).headersSent = true

    errorHandler(streamed, request, res, next)

    expect(next).toHaveBeenCalledWith(streamed)
    expect(sent.status).toBeUndefined()
  })
})
