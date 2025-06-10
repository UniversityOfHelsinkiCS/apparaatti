import StudyRight from '../db/models/studyRight.ts'
import User from '../db/models/user.ts'
import { importerClient } from './importerClient.ts'




//assumes that there is a table Users with studentNumber field
export const fetchStudyRights = async () => {
  console.log('fetching study rights')
  const users: any[] = await User.findAll({
    attributes: ['student_number'],
    raw: true
  })
  console.log('number of users to find study rights for', users.length)
  
  const userChunks = []
  const size = 1000
  for (let i = 0; i < users.length; i += size) {
    userChunks.push(users.slice(i, i + size))
  }

  console.log('number of user chunks', userChunks.length)

  const userCodeChunks = userChunks.map(chunk => 
    chunk
      .map(user => user.student_number)
      .filter(studentNumber => studentNumber !== null && studentNumber !== undefined))

  console.log('number of user code chunks', userCodeChunks.length)

  let runCount = 0
  for (const userCodeChunk of userCodeChunks){
    runCount += 1
    const studentNumbers = userCodeChunk
    const studyRightsReq = await importerClient.post('apparaatti/studyrights', {
      studentNumbers: studentNumbers
    })
    const studyRights = studyRightsReq.data
    
    const creations = studyRights.map((studyRight: any) => {
      return StudyRight.upsert(
        {
          id: studyRight.id,
          personId: studyRight.personId,
          state: studyRight.state,
          educationId: studyRight.educationId,
          organisationId: studyRight.organisationId,
          modificationOrdinal: studyRight.modificationOrdinal,
          documentState: studyRight.documentState,
          valid: studyRight.valid,
          grantDate: studyRight.grantDate,
          studyStartDate: studyRight.studyStartDate,
          transferOutDate: studyRight.transferOutDate,
          termRegistrations: studyRight.termRegistrations,
          studyRightCancellation: studyRight.studyRightCancellation,
          studyRightGraduation: studyRight.studyRightGraduation,
          snapshotDateTime: studyRight.snapshotDateTime,
          acceptedSelectionPath: studyRight.acceptedSelectionPath,
          studyRightTransfer: studyRight.studyRightTransfer,
          studyRightExtensions: studyRight.studyRightExtensions,
          transferOutUniversityUrn: studyRight.transferOutUniversityUrn,
          requestedSelectionPath: studyRight.requestedSelectionPath,
          phase1MinorSelection: studyRight.phase1MinorSelection,
          phase2MinorSelection: studyRight.phase2MinorSelection,
          admissionTypeUrn: studyRight.admissionTypeUrn,
          educationPhase1: studyRight.educationPhase1,
          educationPhase2: studyRight.educationPhase2,
          createdAt: studyRight.createdAt,
          updatedAt: studyRight.updatedAt
        })
    })
    await Promise.all(creations)
    console.log('fetched study rights for', runCount, 'chunks of users')
  }
  return
  console.log('done... all study rights fetched')
}