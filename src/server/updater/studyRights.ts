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

  let runCount = 0
  for (const user of users){
    runCount += 1
    const studentNumber = user.student_number
    if(studentNumber){
      console.log('successfully started fetching studyrights')
      const studyRightsReq = await importerClient.get(`apparaatti/${studentNumber}/studyrights`)
      const studyRights = studyRightsReq.data
      studyRights.forEach((studyRight: any) => {
        StudyRight.upsert(
          {
            id: studyRight.id,
            personId: user.student_number,
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
            createdAt: studyRight.createdAt,
            updatedAt: studyRight.updatedAt
          })        
          .then(() => {
            if(runCount % 1000 === 0) {
              console.log('run count for studyrights', runCount)
            }
          })
      })
    }

   
  }

  console.log('fetched study rights')
}

