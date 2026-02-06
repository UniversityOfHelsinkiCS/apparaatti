import type { CourseRecommendation, UserCoordinates } from '../../common/types.ts'
import { getStudyYear, dateObjToPeriod } from './studyPeriods.ts'


function getComparison(comparisons, field){
  const defaultComparison = {
    field: field,
    filterOnFail: false,
    f: (c: CourseRecommendation, userCoordinates: UserCoordinates, field: string) => {
            
      return c.coordinates[field] === userCoordinates[field]} 
  }
  const comp = comparisons.find((c) => c.field === field)
  
  //we skip if comp field is there to override the default comparison
  //otherwise we use the field from default comp since it is missing from the override
  const filterOnFailValue = comp?.filterOnFail ? comp.filterOnFail : defaultComparison.filterOnFail
  const functionHandle = comp?.f ? comp.f : defaultComparison.f
  const rewardPoints = comp?.rewardPoints
  const mergedComparison = {
    field: field,
    filterOnFail: filterOnFailValue, 
    f: functionHandle,
    rewardPoints
  }

  return mergedComparison
}

function calculatePointsForCourse (c: CourseRecommendation, userCoordinates: UserCoordinates, comparisons){
  let points = 0 

  for(const key in userCoordinates){
    
    if(userCoordinates[key] === null){
      continue
    }

    const comp = getComparison(comparisons, key)
    const match = comp.f(c, userCoordinates, key) 
    const addedPoints = comp?.rewardPoints != undefined ? comp.rewardPoints : 1

    if(match){
      points += addedPoints
    }
    else{
      if(comp.filterOnFail === true){
        return -1
      }
    }
  }
  return points
}

//returns a list of courses that are ordered/filtered based on a point based method
//each dimension is compared with a comparision and if it returns true the course gets a certain amount of points. If not the course does not get the points.
//this is different from the distance based sorting where two opposing coordinates seem to counter each other.
//In this point based one a difference does not punish as much as it gets 'ignored'
function pointRecommendedCourses(courses: CourseRecommendation[], userCoordinates: UserCoordinates, strictFields: any): CourseRecommendation[]{
  //we want to ignore all exams except those that are replacement
  const noExams = courses.filter(c =>
  {
    const isExam = c.course.name.fi?.toLowerCase().includes('tentti')
    const isReplacementCourse = c.coordinates.replacement > 0
    if(isReplacementCourse || !isExam){
      return true
    }
    return false
  })

  const comparisons = [
    {
      field: 'org',
      filterOnFail: true, //always true
    },
    {
      field: 'spesificOrg',
      filterOnFail: false, //always true
      rewardPoints: 10, 
    },
    {
      field: 'mooc',
      filterOnFail: strictFields.includes('mooc'),
    },
    {
      field: 'mentoring',
      filterOnFail: strictFields.includes('mentoring'),
    },
    {
      field: 'challenge',
      filterOnFail: strictFields.includes('challenge'),
    },
    {
      field: 'replacement',
      filterOnFail: strictFields.includes('replacement'),
    },
    {
      field: 'graduation',
      filterOnFail: strictFields.includes('graduation'),
    },
    {
      field: 'flexible',
      filterOnFail: strictFields.includes('flexible'),
    },
    {
      field: 'integrated',
      filterOnFail: strictFields.includes('integrated'),
    },
    {
      field: 'date',
      filterOnFail: false, //always false
      f: (_c: CourseRecommendation, _userCoordinates: UserCoordinates, _field: string) => {return true} //date is handled later on the user side
    },
    {
      field: 'studyPlace',
      filterOnFail: strictFields.includes('study-place'),
    },
    {
      field: 'studyYear',
      filterOnFail: true,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {
        if (!userCoordinates.studyYear || userCoordinates.studyYear === 'neutral') return true
        return userCoordinates.studyYear == c.course.period?.startYear
      }
    },
    {
      field: 'studyPeriod',
      filterOnFail: true,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates) => {
        if (!userCoordinates.studyPeriod || userCoordinates.studyPeriod.includes('neutral')) return true

        const coursePeriods = dateObjToPeriod(new Date(c.course.startDate))
        const match = coursePeriods.some(coursePeriod => 
          userCoordinates.studyPeriod.includes(coursePeriod.name)
        )

        return match
      }
    },
  ]
 
  const recommendationWithPoints = noExams.map((c) => {
    const points = calculatePointsForCourse(c, userCoordinates, comparisons) 
    return {...c, points}
  })

  const filtered = recommendationWithPoints.filter((r) => r.points >= 0)
  const sorted = filtered.sort((a, b) => b.points - a.points)
  return sorted
}


export default pointRecommendedCourses
