import { create } from 'lodash'
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
    console.log('user whose studyright is to be fetched: ')
    console.log(user)
    const studentNumber = user.student_number
    console.log(studentNumber)
    if(studentNumber){
      console.log('successfully started fetching studyrights')
      const studyRightsReq = await importerClient.get(`apparaatti/${studentNumber}/studyrights`)
      const studyRights = studyRightsReq.data
      console.log(studyRights)
      studyRights.forEach((studyRight: any) => {
        console.log('creating study right for user', user.student_number)
        console.log(studyRight)
        StudyRight.create({
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
            console.log('study right created successfully for user')
          })
      })
    }

    if(runCount > 1){
      return
    }
  }

  console.log('fetched study rights')
}

