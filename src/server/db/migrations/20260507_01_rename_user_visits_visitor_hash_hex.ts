import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.renameColumn(
    'user_visits',
    'visitorHashHex',
    'visitor_hash_hex'
  )
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.renameColumn(
    'user_visits',
    'visitor_hash_hex',
    'visitorHashHex'
  )
}
