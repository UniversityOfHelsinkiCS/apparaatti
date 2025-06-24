import { z } from 'zod'
export const AnswerSchema = z.record(z.string().min(1), z.union([z.string().min(1), z.array(z.string().min(1))]))

export type Answer = z.infer<typeof AnswerSchema>
