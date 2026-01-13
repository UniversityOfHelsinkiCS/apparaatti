import StudyRight from '../db/models/studyRight.ts'
import { mangleData } from './mangleData.ts'

const studyRightsHandler = async (studyRights: any[]) => {
  let count = 0
  for(const studyRight of studyRights ){
    await StudyRight.upsert({
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
      updatedAt: studyRight.updatedAt,
    })
    count++
  }
}

//assumes that there is a table Users with studentNumber field
export const fetchStudyRights = async () => {
  const speed = 10000
  await mangleData(
    'studyrights',
    speed,
    studyRightsHandler,
    new Date(2023, 0, 1)
  )
}
