
const primaryLanguageExplanationMarkdown = `
Your language of education affects the completion of your studies.

Read more detailed instructions on the Study Service page
[What is your language of education?](https://studies.helsinki.fi/ohjeet/artikkeli/mika-koulusivistyskieleni)
`


const searchedLanguageExplanationMarkdown = `
All bachelor's degrees include at least 10 credits of compulsory language and communication studies. The studies are completed according to your language of education as follows:

- Mother tongue (Finnish/Swedish) 3 cr
- Second national language (Swedish/Finnish) 3 cr
- Foreign language (starting level in English CEFR B2, in other languages CEFR B1) 4 cr
`

const previouslyDoneLangExplanationMarkdown = `
The compulsory language and communication studies of the degree can be replaced by equivalent studies included in a previous domestic higher education degree and other equivalent previous achievements.
`

export default {
  'common': {},
  'form': {
    'previoslyDoneLangExplanation': previouslyDoneLangExplanationMarkdown,
    'searchedLanguageExplanation': searchedLanguageExplanationMarkdown,
    'primaryLanguageQuestion': 'What is your language of instruction?',
    'languageQuestion': 'What language are you looking for?',
    'primaryLanguageSpecificationQuestion': 'Which primary language type do you want to choose?',
    'previouslyDoneLangQuestion': 'I have completed similar studies or other equivalent achievements in a previous domestic higher education degree (completed or incomplete).',
    'studyPeriodQuestion': 'What is the date of your desired course?',
    'replacementQuestion': 'I feel that I have already acquired knowledge and skills equivalent to those included in my degree in my previous studies / working life / leisure time. (CEFR B1/B2)',
    'mentoringQuestion': 'Do you need practice before completing a course that is part of your degree?',
    'challengeQuestion': 'For me, learning a language is particularly challenging and it makes me very nervous/scared.',
    'graduationQuestion': 'Are you graduating soon?',
    'studyPlaceQuestion': 'Which form of study suits you best?',
    'integratedQuestion': 'I am interested in a course that is integrated into the studies in my field.',
    'independentQuestion': 'I want to work independently or autonomously.',
    'flexibleQuestion': 'I want to take a course with a flexible schedule',
    'moocQuestion': 'Do you want to search for MOOCs (Massive Open Online Courses)?',
    'finnish': 'finnish',
    'swedish': 'swedish',
    'english': 'english',
    'yes': 'Yes',
    'no': 'No',
    'neutralChoice': 'No choice',
    'both': 'Both',
    'written': 'Written communication',
    'spoken': 'Verbal communication',
    'summer': 'Summer',
    'period': 'period',
    'mentoringQuestionYes': 'I would like to have a litle bit of training before starting my studies',
    'mentoringQuestionNo': 'I dont think that i need training',
    'graduationQuestionYes': 'Yes, within half a year.',
    'graduationQuestionNo': 'I am not graduating within half a year.',
    'studyPlaceRemote': 'Studies that include remote sessions',
    'studyPlaceOnline': 'Independent online study',
    'studyPlaceCombined': 'Distance learning and face-to-face teaching',
    'studyPlaceF2F': 'Studies that include face-to-face sessions',
    'studyPlaceNeutral': 'The form of study does not matter',
    'primaryLanguageExplanation': primaryLanguageExplanationMarkdown,
    'replacementQuestion_fi_primary_written': 'Have you written a laudatur or eximia in the mother tongue (Finnish) (or S2) matriculation examination, or are you otherwise a skilled and self-directed writer?',
    'replacementQuestion_fi_secondary_any': 'Are you bilingual (Finnish - Swedish) or do you use Finnish a lot and fluently in your studies and/or in other areas of your life?',
    'challengeQuestion_fi_primary_written': 'Is it difficult for you to participate in implementations that include attendance or joint online meetings due to your life situation or anxiety?',
    'challengeQuestion_fi_primary_spoken': 'I find social situations scary and I get very nervous in different interaction situations.',
  },
  'question': {
    'extrainfo': 'Extra information',
    'checkInstructionsCrediting': 'See instructions for crediting',
    'fromHere': 'from here',
    'noExtrainfo': 'No extra information',
    'pickStudy': 'Select a faculty',
    'skipped': 'Question skipped: no effect',
    'mandatory': 'Mandatory',
    'close': 'Close'
  },
  'app': {
    'logout': 'Log out',
    'questionaire': 'Questionaire',
    'recommendations': 'Recommendations',
    'send': 'Send',
    'back': 'Back'
  },
  'recommendations': {
    'accurate': 'The most accurate recommendations:',
    'all': 'all recommendations (accuracy may vary):',
    'pointbased': 'Point-based recommendations'
  },
  'course': {
    'show': 'Show',
    'credits': 'cr',
    'reasons': 'reasons'
  }
}
