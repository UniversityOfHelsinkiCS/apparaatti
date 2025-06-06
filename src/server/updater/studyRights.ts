import { User } from "../db/models";
import { importerClient } from "./importerClient";




//assumes that there is a table Users with studentNumber field
export const fetchStudyRights = async () => {
  const users: User[] = await User.findAll({
    attributes: ['student_number']
  })

  let runCount = 0
  for (const user of users){
    runCount += 1
    const studentNumber = user?.studentNumber
    if(studentNumber){
      const studyRights = await importerClient.get(`/${studentNumber}/studyrights`)
      console.log(studyRights)
    }

    if(runCount > 1){
      return
    }
  }
}

