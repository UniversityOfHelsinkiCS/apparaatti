import User from '../db/models/user.ts'
import { mangleData } from './mangleData.ts'
import { safeBulkCreate } from './util.ts'

const parsePreferredLanguageUrnToLanguage = (urn: string) => {
  const fallBackLanguage = 'en'
  if (!urn) return fallBackLanguage
  const possibleLanguages = ['fi', 'en', 'sv']
  const splitArray = urn.split(':')
  const language = splitArray[splitArray.length - 1]
  return possibleLanguages.includes(language) ? language : fallBackLanguage
}

interface SisuUser {
  id: string
  preferredLanguageUrn: string
  eduPersonPrincipalName: string
  firstNames: string
  lastName: string
  primaryEmail: string
  studentNumber: string
}

const usersHandler = async (users: SisuUser[]) => {
  const parsedUsers = users.map((user) => {
    return {
      id: user.id,
      language: parsePreferredLanguageUrnToLanguage(user.preferredLanguageUrn),
      username: user.eduPersonPrincipalName
        ? user.eduPersonPrincipalName.split('@')[0]
        : user.id,
      studentNumber: user.studentNumber,
      firstNames: user.firstNames,
      lastName: user.lastName
    }
  })
  const fieldsToUpdate = ['language', 'username', 'studentNumber', 'firstNames', 'lastName']

  await safeBulkCreate({
    entityName: 'User',
    entities: parsedUsers,
    bulkCreate: async (e, opt) => User.bulkCreate(e, opt),
    fallbackCreate: async (e, opt) => User.upsert(e, opt),
    bulkCreateOptions: {
      updateOnDuplicate: fieldsToUpdate,
    },
    fallbackCreateOptions: {
      fields: fieldsToUpdate,
    },
  })
}

export const fetchUsers = async () => {
  await mangleData('persons', 1000, usersHandler)
}
