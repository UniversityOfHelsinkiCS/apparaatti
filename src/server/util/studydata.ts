import StudyRight from '../db/models/studyRight'



const studyRightsForUser = async (user: any) => {
  const studyRights = await StudyRight.findAll({
    where: {
      personId: user.id,
    },
    order: [['modificationOrdinal', 'DESC']],
    raw: true
  })
  if(studyRights.length === 0) {
    console.log('no study rights found for user: ', user.id)
    return []
  }
  console.log('study rights: ', studyRights)
  return studyRights
}


export const getStudyData = async (user: any) => {
  const studyRights = await studyRightsForUser(user)
  if (studyRights.length === 0) {
    console.log('No study rights found for user:', user.id)
    return { studyPhaseName: {fi: 'Opintoa ei löytynyt'} }
  }
  

  const educationPhase1 = studyRights[0].educationPhase1 as any
  const educationPhase2 = studyRights[0].educationPhase2 as any
  
  if(educationPhase1){
    console.log('education phase 2 found for user:', user.id)
    return { studyPhaseName: educationPhase1.name}
  } 
  else if(educationPhase2){
    console.log('education phase 2 found for user:', user.id)
    return { studyPhaseName: educationPhase2.name}
  }
  else {
    console.log('no education phase found for user:', user.id)
    return { studyPhaseName: {fi: 'Opintoa ei löytynyt'} }
  }
}



