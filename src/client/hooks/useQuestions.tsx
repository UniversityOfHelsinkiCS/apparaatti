import { useTranslation } from 'react-i18next'
import { Question } from '../../common/types'



export const pickVariant = (question: Question, languageId: string) => {
  const hit = question.variants.find((v)=> v.name === languageId)
  if(hit){
    return hit
  }

  const fallback = question.variants.find((v) => v.name === 'default')
  return fallback
}



const useQuestions = () => {

  const {t} = useTranslation()
  const finnishChoiceText = t('form:finnish') //{fi: 'suomi', sv: 'finska', en: 'finnish'}
  const swedishChoiceText = t('form:swedish')//{fi: 'ruotsi', sv: 'svenska', en: 'swedish'}
  const englishChoiceText = t('form:english')//{fi: 'englanti', sv: 'engelska', en: 'english'}
  const yesText = t('form:yes')//{fi: 'Kyllä', sv: 'Ja', en: 'Yes'}
  const noText = t('form:no')//{fi: 'Ei', sv: 'Nej', en: 'No'}
  const neutralText = t('form:neutralChoice') //{fi: 'Ei valintaa', sv: 'Inget val', en: 'No choice'}
  const summerText = t('form:summer')
  const periodText = t('form:period')

  const primaryLanguageQuestion = t('form:primaryLanguageQuestion')
  const languageQuestion = t('form:languageQuestion')
  const primaryLanguageSpecificationQuestion = t('form:primaryLanguageSpecificationQuestion')
  const previouslyDoneLangQuestion = t('form:previouslyDoneLangQuestion')
  const studyPeriodQuestion = t('form:studyPeriodQuestion')
  const replacementQuestion = t('form:replacementQuestion')
  const mentoringQuestion = t('form:mentoringQuestion')
  const challengeQuestion = t('form:challengeQuestion')
  const graduationQuestion = t('form:graduationQuestion')
  const studyPlaceQuestion = t('form:studyPlaceQuestion')
  const integratedQuestion = t('form:integratedQuestion')
  const independentQuestion = t('form:independentQuestion')
  const flexibleQuestion = t('form:flexibleQuestion')
  const questions = [
    {
      number: '1',
      mandatory: true,
      effects: 'org',
      id: 'study-field-select',
      type: 'studyphase',
      variants: [
        {
          name: 'default',
          question: t('question:pickStudy')
        }
      ] //there are no variants for this one
    },
    {
      number: '2',
      mandatory: true,
      effects: 'lang',
      id: 'primary-language',
      type: 'primary-language',
      explanation: t('form:primaryLanguageExplanation'),
      variants: [
        {
          name: 'default',
          question: primaryLanguageQuestion,
          options: [
            { id: 'fi', name: finnishChoiceText },
            { id: 'sv', name: swedishChoiceText },
            { id: 'en', name: englishChoiceText },
          ],
        },
      ],
    },
    {
      number: '3',
      mandatory: true,
      effects: 'lang',
      id: 'lang-1',
      type: 'language',
      explanation: t('form:searchedLanguageExplanation'),
      variants: [
        {
          name: 'default',
          question: languageQuestion,

          options: [
            { id: 'fi', name: finnishChoiceText },
            { id: 'sv', name: swedishChoiceText },
            { id: 'en', name: englishChoiceText },
          ],
        },
      ],
    },
    {
      number: '3.1',
      mandatory: true,
      effects: 'lang',
      id: 'primary-language-specification',
      type: 'primary-language-specification',

      variants: [
        {
          name: 'default',
          question: primaryLanguageSpecificationQuestion,
          options: [
            { id: 'writtenAndSpoken', name: t('form:both') /*{ fi: 'Molemmat', sv: 'Både', en: 'Both' }*/ },
            { id: 'written', name: t('form:written')/*{ fi: 'Kirjoitusviestintä', sv: 'skriftlig kommunikation', en: 'Written communication' }*/ },
            { id: 'spoken', name: t('form:spoken') /*{ fi: 'Puheviestintä', sv: 'Röstkommunikation', en: 'Verbal communication' }*/ },
          ],
        },
      ],
    },
    {
      number: '4',
      effects: 'none',
      mandatory: false,
      id: 'previusly-done-lang',
      type: 'previusly-done-lang',
      explanation: t('form:previoslyDoneLangExplanation'),
      variants: [
        {
          name: 'default',
          question: previouslyDoneLangQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },
    // {
    //   
    //   number: '5',
    //   mandatory: false,
    //   effects: 'date',
    //   id: 'study-period',
    //   type: 'period-date',
    //   // explanation: 'Mistä periodista haluat kursseja?',
    //   variants: [
    //     {
    //       name: 'default',
    //       question: studyPeriodQuestion,
    //       options: [
    //         {id: 'neutral', name: neutralText},
    //         {
    //           id: 'intensive_3_previous',
    //           value: 'intensive_3',
    //           name: summerText + ' 25',
    //         },
    //         { id: 'period_1', name:'1. ' + periodText},
    //         { id: 'period_2', name:'2. ' + periodText },
    //         { id: 'period_3', name:'3. ' + periodText },
    //         { id: 'period_4', name:'4. ' + periodText },
    //         { id: 'intensive_3', name: summerText + ' 26'},
    //       ],
    //     },
    //   ],
    // },
    {
      number: '5',
      mandatory: false,
      effects: 'none',
      id: 'replacement',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: replacementQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'fi_primary_written',
          question: t('form:replacementQuestion_fi_primary_written'),
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'fi_secondary_any',
          question: t('form:replacementQuestion_fi_secondary_any'),
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },
    {
      number: '6',
      mandatory: false,
      id: 'mentoring',
      effects: 'mentoring',
      type: 'multi',

      variants: [
        {
          name: 'default',
          question: mentoringQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            {id: '1', name: t('form:mentoringQuestionYes')},
            {id: '0', name: t('form:mentoringQuestionNo')}
          ],
        },
        {
          name: 'fi_secondary_any',
          question: t('form:mentoringQuestion_fi_secondary_any'),
          options: [
            { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },
    {
      number: '7',
      mandatory: false,
      id: 'challenge',
      effects: 'challenge',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: challengeQuestion,
          options: [
            { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'fi_primary_written',
          question: t('form:challengeQuestion_fi_primary_written'),
          options: [
            { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'fi_primary_spoken',
          question: t('form:challengeQuestion_fi_primary_spoken'),
          options: [
            { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
         {
          name: 'fi_secondary_any',
          question: t('form:challengeQuestion_fi_secondary_any'),
          options: [
            { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },  
    {
      number: '8',
      mandatory: false,
      id: 'graduation',
      type: 'multi',

      effects: 'graduation',
      variants: [
        {
          name: 'default',
          question: graduationQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '1', name: t('form:graduationQuestionYes')},
            { id: '0', name: t('form:graduationQuestionNo')},
          ],
        },
      ],
    },
    {
      number: '9',
      mandatory: false,
      id: 'study-place',
      effects: 'studyPlace',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: studyPlaceQuestion,
          options: [
            {id: 'neutral', name: t('form:studyPlaceNeutral')},
            {id: 'remote', name: t('form:studyPlaceRemote')},
            {id: 'online', name: t('form:studyPlaceOnline')},
            { id: 'hybrid', name: t('form:studyPlaceCombined')},
            { id: 'onsite', name: t('form:studyPlaceF2F')},
          ],
        },
      ],
    },
    {
      number: '10',
      mandatory: false,
      id: 'integrated',
      effects: 'integrated',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: integratedQuestion,
          skipped: true,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'en_secondary_any',
          question: integratedQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_secondary_any',
          question: integratedQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },
    {
      number: '11',
      mandatory: false,
      id: 'independent',
      effects: 'independent',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: independentQuestion,
          skipped: true,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'en_secondary_any',
          question: independentQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_secondary_any',
          question: independentQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },
    // {
    //   number: '12',
    //   mandatory: false,
    //   id: 'flexible',
    //   effects: 'flexible',
    //   type: 'multi',
    //   variants: [
    //     {
    //       name: 'default',
    //       question: flexibleQuestion,
    //       options: [
    //         {id: 'neutral', name: neutralText},
    //         {id: '0', name: noText},
    //         {id: '1', name: yesText},
    //       ],
    //     },
    //   ],
    // },
    // {
    //   number: '13',
    //   mandatory: false,
    //   id: 'mooc',
    //   effects: 'mooc',
    //   type: 'multi',
    //   variants: [
    //     {
    //       name: 'default',
    //       question: t('form:moocQuestion'),
    //       options: [
    //         {id: 'neutral', name: neutralText},
    //         { id: '0', name: noText },
    //         { id: '1', name: yesText },
    //       ],
    //     },
    //   ],
    // },  
  ]
  return(questions)
  
}


export default useQuestions
