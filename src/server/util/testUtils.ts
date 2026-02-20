import { TEST_CURRENT_DATE } from './config.ts'

/**
 * Returns the current date, or a mocked date if TEST_CURRENT_DATE is set.
 * Use this instead of `new Date()` for code that needs consistent E2E testing.
 * 
 * @example
 * // In tests, set: TEST_CURRENT_DATE=2026-02-20
 * const now = getCurrentDate() // Returns Feb 20, 2026
 */
export const getCurrentDate = (): Date => {
  if (TEST_CURRENT_DATE) {
    return new Date(TEST_CURRENT_DATE)
  }
  return new Date()
}
