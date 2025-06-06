import User from '../db/models/user.ts'
import { importerClient } from './importerClient.ts'




//assumes that there is a table Users with studentNumber field
export const fetchStudyRights = async () => {
  console.log('fetching study rights')
  const users: User[] = await User.findAll({
    attributes: ['student_number']
  })
  console.log('number of users to find study rights for', users.length)

  let runCount = 0
  for (const user of users){
    runCount += 1
    console.log('user whose studyright is to be fetched: ')
    console.log(user)
    const studentNumber = user.studentNumber
    console.log(studentNumber)
    if(studentNumber){
      console.log('successfully started fetching studyrights')
      const studyRights = await importerClient.get(`/${studentNumber}/studyrights`)
      console.log(studyRights)
    }

    if(runCount > 1){
      return
    }
  }

  console.log('fetched study rights')
}

