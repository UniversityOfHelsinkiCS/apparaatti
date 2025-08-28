import { useTranslation } from 'react-i18next'





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
      effects: 'lang',
      id: 'primary-language',
      type: 'primary-language',
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
      effects: 'lang',
      id: 'lang-1',
      type: 'language',

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
      id: 'previusly-done-lang',
      type: 'previusly-done-lang',
      variants: [
        {
          name: 'default',
          question: previouslyDoneLangQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        }
      ],
    },
    {
      number: '5',
      effects: 'date',
      id: 'study-period',
      type: 'period-date',
      // explanation: 'Mistä periodista haluat kursseja?',
      variants: [
        {
          name: 'default',
          question: studyPeriodQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            {
              id: 'intensive_3_previous',
              value: 'intensive_3',
              name: summerText + ' 25',
            },
            { id: 'period_1', name:'1. ' + periodText},
            { id: 'period_2', name:'2. ' + periodText },
            { id: 'period_3', name:'3. ' + periodText },
            { id: 'period_4', name:'4. ' + periodText },
            { id: 'intensive_3', name: summerText + ' 26'},
          ],
        },
      ],
    },
    {
      number: '6',
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
      ],
    },
    {
      number: '7',
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
      ],
    },
    {
      number: '8',
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
      ],
    },  
    {
      number: '9',
      id: 'graduation',
      type: 'multi',

      effects: 'graduation',
      variants: [
        {
          name: 'default',
          question: graduationQuestion,
          options: [
            { id: '1', name: t('form:graduationQuestionYes')},
            { id: '0', name: t('form:graduationQuestionNo')},
          ],
        },
      ],
    },
    {
      number: '10',
      id: 'study-place',
      effects: 'studyPlace',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: studyPlaceQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: 'remote', name: t('form:studyPlaceRemote')},
            { id: 'hybrid', name: t('form:studyPlaceCombined')},
            { id: 'onsite', name: t('form:studyPlaceF2F')},
          ],
        },
      ],
    },
    {
      number: '11',
      id: 'integrated',
      effects: 'integrated',
      type: 'multi',
      variants: [
        {
          name: 'default',
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
      number: '12',
      id: 'independent',
      effects: 'independent',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: independentQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },
    {
      number: '13',
      id: 'flexible',
      effects: 'flexible',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: flexibleQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            {id: '0', name: noText},
            {id: '1', name: yesText},
          ],
        },
      ],
    },
    {
      number: '14',
      id: 'mooc',
      effects: 'mooc',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: t('form:moocQuestion'),
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },  
  ]
  return(questions)
  
}


export default useQuestions
