import { useTranslation } from 'react-i18next'
import { Question, Variant } from '../../common/types'



export const pickVariant = (question: Question, variantId: string) => {
  const hit = question.variants.find((v)=> v.name === variantId)
  if(hit){
    return hit
  }

  const fallback = question.variants.find((v) => v.name === 'default')
  return fallback
}




export const variantLookUp: Map<{language: string, primaryLanguage: string, primaryLanguageSpecification: string}, string> = new Map([
  [{language: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: 'written' }, 'fi_primary_written'],
  [{language: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: 'spoken' }, 'fi_primary_spoken'],
  [{language: 'fi', primaryLanguage: 'fi', primaryLanguageSpecification: 'writtenAndSpoken' }, 'fi_primary_written'],
  [{language: 'fi', primaryLanguage: 'sv', primaryLanguageSpecification: '' }, 'fi_secondary_any'],
  [{language: 'en', primaryLanguage: '', primaryLanguageSpecification: '' }, 'en_secondary_any'],
  [{language: 'sv', primaryLanguage: 'sv', primaryLanguageSpecification: 'spoken' }, 'sv_primary_spoken'],
  [{language: 'sv', primaryLanguage: 'sv', primaryLanguageSpecification: 'written' }, 'sv_primary_written'],
  [{language: 'sv', primaryLanguage: 'sv', primaryLanguageSpecification: '' }, 'sv_primary_any'],
  [{language: 'sv', primaryLanguage: 'fi', primaryLanguageSpecification: '' }, 'sv_secondary_any'],
  [{language: 'sv', primaryLanguage: 'en', primaryLanguageSpecification: '' }, 'sv_secondary_any'],
])

export const pickQuestionExplanation = (variantId: string | undefined, question: Question, t) => {
  if(variantId){
    const explanationVariant = question.variants.find((v) => v.name === variantId)
    if(explanationVariant?.explanation){
      return explanationVariant.explanation
    }
  }

  return question.explanation || t('question:noExtrainfo')
}

const checkVarianLookUpParam = (cmpr: string, shouldBe: string) => {
  //if shouldBe is an empty string it is intended as 'anything is allowed for this'
  if(shouldBe === ''){
    return true
  }
  return cmpr === shouldBe
}
// variant display is the different wording of a question given different choices of language, primary language and primary language specification
export const updateVariantToDisplayId = (language: string, primaryLanguage: string, primaryLanguageSpecification: string): string => {
  for(const key of variantLookUp.keys()){
    if(checkVarianLookUpParam(language, key.language) &&
       checkVarianLookUpParam(primaryLanguage, key.primaryLanguage) &&
       checkVarianLookUpParam(primaryLanguageSpecification, key.primaryLanguageSpecification)
    ){
      return variantLookUp.get(key) || 'default'
    }
  }
  return 'default'
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
  const questions: Question[] = [
    {
      number: '',
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
      number: '',
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
            // { id: 'en', name: englishChoiceText }, commented out for now since the POC will not need to support this...
          ],
        },
      ],
    },
    {
      number: '',
      mandatory: true,
      effects: 'lang',
      id: 'lang',
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
      number: '',
      mandatory: true,
      effects: 'lang',
      id: 'primary-language-specification',
      isSubQuestionForQuestionId: 'lang',
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
      number: '',
      effects: 'none',
      mandatory: false,
      id: 'previusly-done-lang',
      type: 'previusly-done-lang',
      explanation: t('form:previoslyDoneLangExplanation'),
      extraInfo:  t('question:checkInstructionsCrediting'),
      variants: [
        {
          name: 'default',
          question: previouslyDoneLangQuestion,
          options: [
            // {id: 'neutral', name: neutralText},
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
      number: '',
      mandatory: false,
      effects: 'none',
      id: 'replacement',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: replacementQuestion,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          explanation: 'Suomi äidinkielenä oleva infolaatikko',
          name: 'fi_primary_written',
          question: t('form:replacementQuestion_fi_primary_written'),
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'fi_secondary_any',
          question: t('form:replacementQuestion_fi_secondary_any'),
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'en_secondary_any',
          question: t('form:replacementQuestion_en_secondary_any'),
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_secondary_any',
          question: t('form:replacementQuestion_sv_secondary_any'),
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_primary_written',
          question: t('form:replacementQuestion_sv_primary_written'),        options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },
    {
      number: '',
      mandatory: false,
      id: 'mentoring',
      effects: 'mentoring',
      type: 'multi',

      variants: [
        {
          name: 'default',
          question: mentoringQuestion,
          options: [
            // {id: 'neutral', name: neutralText},
            {id: '1', name: t('form:mentoringQuestionYes')},
            {id: '0', name: t('form:mentoringQuestionNo')}
          ],
        },
        {
          name: 'fi_secondary_any',
          question: t('form:mentoringQuestion_fi_secondary_any'),
          options: [
            // { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_primary_spoken',
          question: '',
          skipped: true,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_primary_written',
          question: mentoringQuestion,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },
    {
      number: '',
      mandatory: false,
      id: 'finmu',
      effects: 'finmu',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: '',
          skipped: true,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          //this was originally part of mentoring but because mentoring directs to different courses it needed its own question
          name: 'fi_secondary_any',
          question: t('form:finmuMentoringQuestion_fi_secondary_any'),
          options: [
            // { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ]
    },
    {
      number: '',
      mandatory: false,
      id: 'challenge',
      effects: 'challenge',
      type: 'multi',
      variants: [
        {
          name: 'default',
          question: challengeQuestion,
          options: [
            // { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'fi_primary_written',
          question: t('form:challengeQuestion_fi_primary_written'),
          options: [
            // { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'fi_primary_spoken',
          question: t('form:challengeQuestion_fi_primary_spoken'),
          options: [
            // { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'fi_secondary_any',
          question: t('form:challengeQuestion_fi_secondary_any'),
          options: [
            // { id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_primary_spoken',
          question: '',
          skipped: true,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_primary_written',
          question: '',
          skipped: true,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_primary_any',
          question: '',
          skipped: true,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },  
    {
      number: '',
      mandatory: false,
      id: 'graduation',
      type: 'multi',

      effects: 'graduation',
      variants: [
        {
          name: 'default',
          question: graduationQuestion,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '1', name: t('form:graduationQuestionYes')},
            { id: '0', name: t('form:graduationQuestionNo')},
          ],
        },
      ],
    },
    {
      number: '',
      mandatory: false,
      id: 'study-place',
      effects: 'studyPlace',
      type: 'study-place',
      variants: [
        {
          name: 'default',
          question: studyPlaceQuestion,
          options: [
            // {id: 'neutral', name: t('form:studyPlaceNeutral')},
            {id: 'teaching-participation-remote', name: t('form:studyPlaceRemote')},
            {id: 'teaching-participation-online', name: t('form:studyPlaceOnline')},
            { id: 'teaching-participation-blended', name: t('form:studyPlaceCombined')},
            { id: 'teaching-participation-contact', name: t('form:studyPlaceF2F')},
          ],
        },
      ],
    },
    {
      number: '',
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
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'en_secondary_any',
          question: integratedQuestion,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_secondary_any',
          question: integratedQuestion,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
      ],
    },
    {
      number: '',
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
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'en_secondary_any',
          question: independentQuestion,
          options: [
            // {id: 'neutral', name: neutralText},
            { id: '0', name: noText },
            { id: '1', name: yesText },
          ],
        },
        {
          name: 'sv_secondary_any',
          question: independentQuestion,
          options: [
            // {id: 'neutral', name: neutralText},
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
