// In edit mode the admin picks answers to preview a variant, not to get recommendations.
// Mandatory answers may therefore be left empty ("mikä tahansa").

type AutoOpenInput = {
  isEditMode: boolean
  hasUnansweredMandatory: boolean
  hasVisited: boolean
  hasEducationLanguage: boolean
}

/** The welcome modal opens by itself only outside edit mode. */
export const shouldAutoOpenWelcomeModal = ({
  isEditMode,
  hasUnansweredMandatory,
  hasVisited,
  hasEducationLanguage,
}: AutoOpenInput): boolean => !isEditMode && (hasUnansweredMandatory || (!hasVisited && !hasEducationLanguage))

export const canCloseWelcomeModal = ({
  isEditMode,
  mandatoryQuestionsAnswered,
}: {
  isEditMode: boolean
  mandatoryQuestionsAnswered: boolean
}): boolean => isEditMode || mandatoryQuestionsAnswered

/** Recommendations need a faculty; in edit mode an empty faculty skips them. */
export const shouldFetchRecommendations = ({
  isEditMode,
  organisationCode,
}: {
  isEditMode: boolean
  organisationCode: string
}): boolean => !(isEditMode && organisationCode === '')
