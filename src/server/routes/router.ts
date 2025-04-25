import express from 'express';
import { FORM } from '../data/form.ts';
import { AnswerSchema } from '../../common/validators.ts';
import Answer from '../db/models/answer.ts';
import User from '../db/models/user.ts';
import passport from 'passport';
import type { CourseRecommendation } from '../../common/types.ts';
import Form from '../db/models/form.ts';


const router = express.Router();

router.use(express.json());

router.get('/form/1', async (_req, res) => {
  const form = await Form.findByPk(1);

  res.json(form);
});



async function saveAnswer(answerData: any, user: User) {

  const answer = await Answer.create({
    answer: answerData,
    userId: user.id,
    formId: 1,
  });
  return answer;
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

//calculates distance between user and course coordinates, assumes 3 dimensions
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

router.post('/form/1/answer', async (req, res) => {
  const answerData = AnswerSchema.parse(req.body);


  const user = await User.findByPk("1");

  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return
  }

  await saveAnswer(answerData, user)

  const userCoordinates = calculateUserCoordinates(answerData);
  const recommendations = getRecommendations(userCoordinates);


  res.json(recommendations);
})

router.get('/login', passport.authenticate('oidc'))

router.get('/login/callback', passport.authenticate('oidc', { failureRedirect: '/' }), async (req, res) => {
  res.redirect('/');
})


router.get('/user', async (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }
  res.json(req.user);
})

router.get('/fail', async (_req, res) => {
  res.json({
    message: 'Login failed',
  });
})


router.get('/logout', async (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return
  }

  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/')  
  })

  res.redirect('/');

  
})



export default router;