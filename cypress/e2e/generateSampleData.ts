//proudly vibe coded generation of inputs

import { AnswerData } from '../../../src/common/types';

export type RecommendationRequest = {
  answers: AnswerData;
  hyGroupCn: string;
  studentNumber: string;
};

/**
 * WARNING: This function generates all possible combinations of answers.
 * The total number of combinations is very large (over 150 million).
 * Calling this function and trying to collect all results will likely crash the application.
 * It is recommended to use this as a generator and take only a limited number of samples.
 */
export function* generateSampleData(): Generator<RecommendationRequest> {
  const studyPeriods = ['neutral', 'intensive_3_previous', 'period_1', 'period_2', 'period_3', 'period_4', 'intensive_3'];
  const yesNoNeutral = ['neutral', '1', '0'];
  const studyPlaces = ['neutral', 'remote', 'hybrid', 'onsite'];
  const orgCodes = ['H50', 'H20', 'H10', 'H74', 'H70', 'H90', 'H60', 'H57', 'H80', '4141', 'H305', 'H30', 'H3456', '414', 'H55'];
  const languages = ['fi', 'sv', 'en'];
  const langSpecs = ['writtenAndSpoken', 'written', 'spoken'];

  function* getCombinations(arr: string[]): Generator<string[]> {
    for (let i = 0; i < (1 << arr.length); i++) {
      const combination: string[] = [];
      for (let j = 0; j < arr.length; j++) {
        if ((i >> j) & 1) {
          combination.push(arr[j]);
        }
      }
      yield combination;
    }
  }

  for (const studyPeriod of getCombinations(studyPeriods)) {
    for (const graduation of yesNoNeutral) {
      for (const mentoring of yesNoNeutral) {
        for (const integrated of yesNoNeutral) {
          for (const studyPlace of studyPlaces) {
            for (const replacement of yesNoNeutral) {
              for (const challenge of yesNoNeutral) {
                for (const independent of yesNoNeutral) {
                  for (const flexible of yesNoNeutral) {
                    for (const mooc of yesNoNeutral) {
                      for (const studyField of orgCodes) {
                        for (const lang1 of languages) {
                          for (const primaryLanguage of languages) {
                            for (const langSpec of langSpecs) {
                              yield {
                                  'study-period': studyPeriod,
                                  'graduation': graduation,
                                  'mentoring': mentoring,
                                  'integrated': integrated,
                                  'study-place': studyPlace,
                                  'replacement': replacement,
                                  'challenge': challenge,
                                  'independent': independent,
                                  'flexible': flexible,
                                  'mooc': mooc,
                                  'study-field-select': studyField,
                                  'lang-1': lang1,
                                  'primary-language': primaryLanguage,
                                  'primary-language-specification': langSpec}
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
