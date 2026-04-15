import type { CourseRecommendation, UserCoordinates } from '../../common/types.ts'
import { bonusPoint, extraRewardPoints, pointForCorrectFilter, strictFailurePoint } from './constants.ts'
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
    const addedPoints = comp?.rewardPoints != undefined ? comp.rewardPoints : pointForCorrectFilter //here we give more points than in exceptions in order to make the users picks weigh more 

    if(match){
      points += addedPoints
    }
    else{
      if(comp.filterOnFail === true){
        return strictFailurePoint
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

  const comparisons = [
    {
      field: 'org',
      filterOnFail: true, //always true
    },
    {
      field: 'collaboration',
      filterOnFail: strictFields.includes('collaboration'), 
    },
    {
      field: 'spesificOrg',
      filterOnFail: true, //always true
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
      rewardPoints: extraRewardPoints //due to the exceptions this filter needs some extra boost to get pushed up 
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

        if (!c.course.period || c.course.period.length === 0) return false
        
        return c.course.period.some(p => userCoordinates.studyYear === p.startYear)
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
    {
      field: 'multiPeriod',
      filterOnFail: strictFields.includes('multi-period'),
    },
    {
      field: 'exam',
      filterOnFail: strictFields.includes('exam'),
    },
  ]
 
  const recommendationWithPoints = courses.map((c) => {
    const points = calculatePointsForCourse(c, userCoordinates, comparisons)


    // Bonus point tiers (when no other filters active):
    //   1. faculty-specific mandatory (RUFARM, RUMATLU, ENLAAK…) → 4×
    //   2. generic / KAIKKI                                       → 3×
    //   3. numbered (ENG-201, RUO-205…)                          → 2×
    //   4. ERI / challenge                                        → 0× (unless user wants challenge)
    const isEriOrChallenge  = c.coordinates.challenge === 1 || c.course.courseCodes.some(code => code.includes('ERI'))
    const isGeneric = c.course.courseCodes.some(code => code.includes('KAIKKI'))
    // const isNumbered = c.course.courseCodes.some(code => /\d+$/.test(code))

    //those courses that are not mentoring courses are mandatory courses
    //courses that are mentoring courses (value of 1) are usually numbered courses
    const isMandatory = c.coordinates.mentoring === 0 

    let bonusPoints = 0
    if (!isEriOrChallenge) {
      if (isMandatory && !isGeneric)  bonusPoints = bonusPoint * 5  // tier 1: faculty-specific
      else if (isGeneric)  bonusPoints = bonusPoint * 4  // tier 2: KAIKKI
      else if (!isMandatory) bonusPoints = bonusPoint * 3  // tier 3: numbered
    }

    return points >= 0 ? {...c, points: points + bonusPoints} : {...c, points}
  })

  const filtered = recommendationWithPoints.filter((r) => r.points >= 0)
  const sorted = filtered.sort((a, b) => b.points - a.points)
  return sorted
}


export default pointRecommendedCourses
