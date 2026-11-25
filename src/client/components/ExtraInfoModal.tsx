import { useTranslation } from 'react-i18next'

import type { VariantQuery } from '../../common/conditionMatching'
import { ANY_VARIANT_QUERY, defaultVariant } from '../../common/conditionMatching'
import { Question } from '../../common/types'
import useModalLabels from '../hooks/useModalLabels'
import { pickQuestionExplanation } from '../hooks/useQuestions'
import AppMarkdown from './common/AppMarkdown'
import HyButton from './common/hy/HyButton'
import HyModal from './common/hy/HyModal'
import EditableText from './editMode/EditableText'
import { useEditScope } from './editMode/editScope'

const ExtraInfoModal = ({
  question,
  open,
  handleClose,
  currentVariant,
}: {
  question: Question
  open: boolean
  handleClose: () => void
  currentVariant?: VariantQuery
}) => {
  const { t } = useTranslation()
  const modalLabels = useModalLabels()
  const scope = useEditScope()

  const explanationToShow = pickQuestionExplanation(currentVariant, question, t)
  const variant = scope?.rawVariant
  const sharedExplanation = defaultVariant(question.raw?.variants ?? [])?.explanation ?? question.raw?.explanation

  const editable = (
    <EditableText
      filterId={question.id}
      field="explanation"
      variantName={scope?.variantName ?? ''}
      isFallbackVariant={scope?.isFallbackVariant ?? false}
      variantQuery={scope?.variantQuery ?? ANY_VARIANT_QUERY}
      filterVariants={question.raw?.variants ?? []}
      current={variant?.explanation ?? sharedExplanation}
      filterText={sharedExplanation ?? null}
      block
    >
      <AppMarkdown>{explanationToShow}</AppMarkdown>
    </EditableText>
  )

  return (
    <HyModal
      open={open}
      onClose={handleClose}
      labels={modalLabels}
      title={t('question:extrainfo')}
      footer={
        <HyButton variant="secondary" colour="black" onClick={handleClose}>
          {t('question:close')}
        </HyButton>
      }
    >
      {editable}
    </HyModal>
  )
}

export default ExtraInfoModal
