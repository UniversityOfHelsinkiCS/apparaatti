import { useTranslation } from 'react-i18next'





const useQuestions = () => {

  const finnishChoiceText = {fi: 'suomi', sv: 'finska', en: 'finnish'}
  const swedishChoiceText = {fi: 'ruotsi', sv: 'svenska', en: 'swedish'}
  const englishChoiceText = {fi: 'englanti', sv: 'engelska', en: 'english'}
  const yesText = {fi: 'Kyllä', sv: 'Ja', en: 'Yes'}
  const noText = {fi: 'Ei', sv: 'Nej', en: 'No'}
  const neutralText = {fi: 'Ei valintaa', sv: 'Inget val', en: 'No choice'}

  const {t, i18n} = useTranslation()
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
      id: 'primary-language-specification',
      type: 'primary-language-specification',

      variants: [
        {
          name: 'default',
          question: primaryLanguageSpecificationQuestion,
          options: [
            { id: 'writtenAndSpoken', name: { fi: 'Molemmat', sv: 'Både', en: 'Both' } },
            { id: 'written', name: { fi: 'Kirjoitusviestintä', sv: 'skriftlig kommunikation', en: 'Written communication' } },
            { id: 'spoken', name: { fi: 'Puheviestintä', sv: 'Röstkommunikation', en: 'Verbal communication' } },
          ],
        },
      ],
    },
    {
      id: 'previusly-done-lang',
      type: 'previusly-done-lang',
      variants: [
        {
          name: 'default',
          question: previouslyDoneLangQuestion,
          options: [
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        }
      ],
    },
    {
      id: 'study-period',
      type: 'period-date',
      explanation: 'Mistä periodista haluat kursseja?',
      variants: [
        {
          name: 'default',
          question: studyPeriodQuestion,
          options: [
            {
              id: 'intensive_3_previous',
              value: 'intensive_3',
              name: { fi: 'Kesä 25', sv: 'Sommar 25', en: 'Summer 25' },
            },
            { id: 'period_1', name: { fi: '1. periodi', sv: '1. period', en: '1. period' } },
            { id: 'period_2', name: { fi: '2. periodi' , sv: '2. period', en: '2. period' } },
            { id: 'period_3', name: { fi: '3. periodi' , sv: '3. period', en: '3. period' } },
            { id: 'period_4', name: { fi: '4. periodi' , sv: '4. period', en: '4. period' } },
            { id: 'intensive_3', name: { fi: 'Kesä 26', sv: 'Sommar 26', en: 'Summer 26' } },
          ],
        },
      ],
    },
    {
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
      id: 'mentoring',
      type: 'multi',

      variants: [
        {
          name: 'default',
          question: mentoringQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '1', name: { fi: 'Kaipaisin valmennusta ennen opintojen suoritusta', sv: 'Jag skulle vilja ha lite handledning innan jag avslutar mina studier.', en: 'I would like to have a litle bit of training before starting my studies' } },
            { id: '0', name: { fi: 'En koe tarvitsevani harjoitusta',  sv: 'Jag känner inte att jag behöver motion.', en: 'I dont think that i need training' }},
          ],
        },
      ],
    },
    {
      id: 'challenge',
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
      id: 'graduation',
      type: 'multi',

      variants: [
        {
          name: 'default',
          question: graduationQuestion,
          options: [
            { id: '1', name: { fi: 'Kyllä, puolen vuoden sisällä.', sv: 'Ja, inom sex månader.', en: 'Yes, within half a year.' } },
            {
              id: '0',
              name: { fi: 'En ole valmistumassa puolen vuoden sisällä.', sv: 'Jag tar inte examen om sex månader.', en: 'I am not graduating within half a year.' },
            },
          ],
        },
      ],
    },
    {
      id: 'study-place',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: studyPlaceQuestion,
          options: [
            { id: 'remote', name: { fi: 'Täysin etäopiskelu', sv: 'Helt distansundervisning', en: 'Only Distance learning' } },
            { id: 'hybrid', name: { fi: 'Etäopiskelu ja lähiopetus', sv: 'Distansundervisning och undervisning ansikte mot ansikte', en: 'Distance learning and face-to-face teaching' } },
            { id: 'onsite', name: { fi: 'Täysin lähiopetus', sv: 'Helt ansikte mot ansikte-undervisning', en: 'Only face-to-face teaching' } },
          ],
        },
      ],
    },
    {
      id: 'integrated',
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
      id: 'independent',
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
      id: 'flexible',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: flexibleQuestion,
          options: [
            {id: 'neutral', name: neutralText},
            { id: '0', name: noText},
            { id: '1', name: yesText},
          ],
        },
      ],
    },  
  ]
  return(questions)
  
}


export default useQuestions
