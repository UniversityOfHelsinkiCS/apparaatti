

import type { Migration } from '../connection.ts'

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addIndex('cur_cu', ['cu_id'], {
    name: 'cu_index',
  })
  await queryInterface.addIndex('cur_cu', ['cur_id'], {
    name: 'cur_index',
  })
}

export const down: Migration = async ({context: queryInterface}) => {
  await queryInterface.removeIndex('cur_cu', 'cu_index')
  await queryInterface.removeIndex('cur_cu', 'cur_index')

}
 
