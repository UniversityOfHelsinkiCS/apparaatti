import Organisation from '../db/models/organisation'
import { mangleData } from './mangleData'
import { safeBulkCreate } from './util'

const organisationsHandler = async (organisations: any) => {
  const ids = new Set()
  const uniqueOrganisations = organisations.filter((org) => {
    if (!ids.has(org.id)) {
      ids.add(org.id)
      return true
    }
    return false
  })

  const fieldsToUpdate = [
    'name', 
    'code', 
    'parentId'
  ]

  await safeBulkCreate({
    entityName: 'Organisation',
    entities: uniqueOrganisations,
    bulkCreate: async (e: any, opt) => Organisation.bulkCreate(e, opt),
    fallbackCreate: async (e: any, opt) => Organisation.upsert(e, opt),
    bulkCreateOptions: {
      updateOnDuplicate: fieldsToUpdate,
    },
    fallbackCreateOptions: {
      fields: fieldsToUpdate,
    },
  })
}

const fetchOrganisations = async () => {
  await mangleData('organisations', 3000, organisationsHandler)
}

export default fetchOrganisations