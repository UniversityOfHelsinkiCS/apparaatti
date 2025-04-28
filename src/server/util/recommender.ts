//calculates distance between user and course coordinates, assumes 3 dimensions

import type { CourseRecommendation } from "../../common/types.ts";

function recommendCourses(answerData) {
  const userCoordinates = calculateUserCoordinates(answerData);
  const recommendations = getRecommendations(userCoordinates);
  return recommendations;
}



function convertAnswerValueToFloat(answerValue){
  switch (answerValue) {
    case '1':
      return 0.0;
    case '2':
      return 0.5;
    case '3':
      return 1.0;
    default:
      return 0.0;
  }
}


function calculateUserCoordinates(answerData: any) {
  console.log('Calculating user coordinates based on answer data:', answerData);
  const userCoordinates = {
    fear: convertAnswerValueToFloat(answerData['1']),
    teachingMethod: convertAnswerValueToFloat(answerData['2']),
    experience: convertAnswerValueToFloat(answerData['3']),
  }
  console.log('User coordinates:', userCoordinates);
  return userCoordinates;
}



//returns a list of [{course, distance}] 
function calculateUserDistances(userCoordinates: any, availableCourses: CourseRecommendation[]) {
  const distances = availableCourses.map(course => { 
    const courseCoordinates = course.courseRecommendationCoordinates;
    const distance = Math.sqrt(
      Math.pow(userCoordinates.fear - courseCoordinates.fear, 2) +
      Math.pow(userCoordinates.teachingMethod - courseCoordinates.teachingMethod, 2) +
      Math.pow(userCoordinates.experience - courseCoordinates.experience, 2)
    );
    return { ...course, distance };
  })

  return distances
}

function getRecommendations(userCoordinates){
  // Mock recommendation logic
  const availableCourses: CourseRecommendation[] = [
    {
      id: '1',
      name: 'Course 1',
      description: 'Description 1',
      courseCode: 'CS101',
      credits: 5,
      url: 'https://example.com/course1',
      courseRecommendationCoordinates: {
        fear: 0.5,
        teachingMethod: 0.5,
        experience: 0.5,
      }
    },
    {
      id: '2',
      name: 'Course 2',
      description: 'Description 2',
      courseCode: 'CS102',
      credits: 5,
      url: 'https://example.com/course2',
      courseRecommendationCoordinates: {
        fear: 1.0,
        teachingMethod: 1.0,
        experience: 0,
      }
    },
    {
      id: '3',
      name: 'Course 3',
      description: 'Description 3',
      courseCode: 'CS103',
      credits: 5,
      url: 'https://example.com/course3',
      courseRecommendationCoordinates: {
        fear: 0.0,
        teachingMethod: 0,
        experience: 1.0,
      }
    },
    {
      id: '4',
      name: 'Course 4',
      description: 'Description 4',
      courseCode: 'CS103',
      credits: 5,
      url: 'https://example.com/course3',
      courseRecommendationCoordinates: {
        fear: 0.0,
        teachingMethod: 0.0,
        experience: 0.0,
      }
    },
    {
      id: '5',
      name: 'Course 5',
      description: 'Description 5',
      courseCode: 'CS103',
      credits: 5,
      url: 'https://example.com/course3',
      courseRecommendationCoordinates: {
        fear: 1.0,
        teachingMethod: 1.0,
        experience: 1.0,
      }
    }
  ]

  const distances = calculateUserDistances(userCoordinates, availableCourses);
  const sortedCourses = distances.sort((a, b) => a.distance - b.distance);
  const recommendations = sortedCourses.slice(0, 3).map(course => ({
    id: course.id,
    name: course.name,
    description: course.description,
    courseCode: course.courseCode,
    credits: course.credits,
    url: course.url,
    courseRecommendationCoordinates: course.courseRecommendationCoordinates,
  }));

  
  return recommendations;
}


export default recommendCourses;