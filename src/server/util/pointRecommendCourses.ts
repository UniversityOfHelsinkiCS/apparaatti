import type { AnswerData, CourseRecommendation, UserCoordinates } from '../../common/types.ts'
import { getRelevantPeriods, readAnswer } from './recommender.ts'


function getComparison(comparisons, field){
  console.log('hi from comparison')
  const defaultComparison = {
    field: field,
    filterOnFail: false,
    f: (c: CourseRecommendation, userCoordinates: UserCoordinates, field: string) => {

      console.log('default function used for')
      console.log(field)
      console.log(c.coordinates[field])
      console.log(userCoordinates[field])
            
      return c.coordinates[field] === userCoordinates[field]} 
  }
  console.log('before comp find')
  const comp = comparisons.find((c) => c.field === field)
  
  //we skip if comp field is there to override the default comparison
  //otherwise we use the field from default comp since it is missing from the override
  console.log('before merged comp')
  const filterOnFailValue = comp?.filterOnFail ? comp.filterOnFail : defaultComparison.filterOnFail
  console.log(filterOnFailValue)
  const functionHandle = comp?.f ? comp.f : defaultComparison.f
  console.log(functionHandle)
  const mergedComparison = {
    field: field,
    filterOnFail: filterOnFailValue, 
    f: functionHandle
  }

  console.log('end of get comp')
  console.log(mergedComparison)
  return mergedComparison
}

function calculatePointsForCourse (c: CourseRecommendation, userCoordinates: UserCoordinates, comparisons){
  console.log('got here v2')
  let points = 0 

  for(const key in userCoordinates){
    
    if(!userCoordinates[key]){
      continue
    }

    console.log('before get')
    const comp = getComparison(comparisons, key)
    console.log('before comp func')
    const match = comp.f(c, userCoordinates, key) 
    console.log('before match func')
    if(match){
      console.log('success on key')
      console.log(key)
      points++
    }
    else{

      console.log('fail on key')
      console.log(key)
      if(comp.filterOnFail === true){

        return -1
      }
    }
  }

  console.log('end of calculate')
  return points
}

//returns a list of courses that are ordered/filtered based on a point based method
//each dimension is compared with a comparision and if it returns true the course gets a certain amount of points. If not the course does not get the points.
//this is different from the distance based sorting where two opposing coordinates seem to counter each other.
//In this point based one a difference does not punish as much as it gets 'ignored'
function pointRecommendedCourses(courses: CourseRecommendation[], userCoordinates: UserCoordinates, answerData: AnswerData): CourseRecommendation[]{
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
 

  console.log('courses before filter')
  console.log(courses.length)
  const pickedPeriods = getRelevantPeriods(readAnswer(answerData, 'study-period'))

  // console.log('---DEBUG---')
  // console.log(pickedPeriods)
  // console.log('------')

  type ComparisonType = {
    field?: string
    filterOnFail: boolean,
    f?: (c: CourseRecommendation, userCoordinates: UserCoordinates) => boolean
  }
 
  const comparisons = [
    {
      field: 'org',
      filterOnFail: true, 
    },
    {
      field: 'mooc',
      filterOnFail: true,
    },
    {
      field: 'mentoring',
      filterOnFail: true,
    },
    {
      field: 'date',
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates, field: string) => {return true} //not implemented yet
    },
    {
      field: 'studyPlace',
      filterOnFail: false,
      f: (c: CourseRecommendation, userCoordinates: UserCoordinates, field: string) => {return true} //not implemented yet
    },
  ]
  console.log('count before: ', noExams.length)
 
  const recommendationWithPoints = noExams.map((c) => {
    const points = calculatePointsForCourse(c, userCoordinates, comparisons) 
    console.log(points)
    return {...c, points}
  })

  console.log('we got here')
  console.log(recommendationWithPoints.length)

  const filtered = recommendationWithPoints.filter((r) => r.points >= 0)
  const sorted = filtered.sort((a, b) => b.points - a.points)


  console.log('courses after filter')
  console.log(filtered.length)
  return sorted
}


export default pointRecommendedCourses
