import Organisation from '../db/models/organisation.ts'
import StudyRight from '../db/models/studyRight.ts'

const studyRightsForUser = async (user: any) => {
  const studyRights = await StudyRight.findAll({
    where: {
      personId: user.id,
    },
    order: [['modificationOrdinal', 'DESC']],
    raw: true,
  })
  if (studyRights.length === 0) {
    console.log('no study rights found for user: ', user.id)
    return []
  }
  //console.log('study rights: ', studyRights)
  return studyRights
}

export const getStudyData = async (user: any) => {
  const studyRights = (await studyRightsForUser(user)) as any[]
  if (studyRights.length === 0) {
    console.log('No study rights found for user:', user.id)
    return { studyPhaseName: { fi: 'Opintoa ei löytynyt' } }
  }

  const phase1EducationPhases = studyRights.map(
    (studyRight) => studyRight.educationPhase1
  )
  const phase1StudyData = phase1EducationPhases
    .filter((phase) => phase !== null)
    .map((phase) => {
      return {
        id: phase.id,
        code: phase.code,
        name: phase.name,
      }
    })

  const phase2EducationPhases = studyRights.map(
    (studyRight) => studyRight.educationPhase2
  )
  const phase2StudyData = phase2EducationPhases
    .filter((phase) => phase !== null)
    .map((phase) => {
      return {
        id: phase.id,
        code: phase.code,
        name: phase.name,
      }
    })
  
  const organisationIds: string[] = []
  for (const studyRight of studyRights) {
    if (studyRight.organisationId && !organisationIds.includes(studyRight.organisationId)) {
      organisationIds.push(studyRight.organisationId)
    }
  }

  const organisations = await Organisation.findAll({
    attributes: ['id', 'name', 'code'],
    where: {
      id: organisationIds,
    },
    raw: true,
  })


  return {
    phase1Data: phase1StudyData,
    phase2Data: phase2StudyData,
    organisations: organisations
  }
}
