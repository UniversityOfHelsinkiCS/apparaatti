import { useTranslation } from 'react-i18next'

import { Question } from '../../common/types'
import { pickQuestionExplanation } from '../hooks/useQuestions'
import AppMarkdown from './common/AppMarkdown'
import HyButton from './common/hy/HyButton'
import HyModal from './common/hy/HyModal'

const ExtraInfoModalV2 = ({
  question,
  open,
  handleClose,
  currentVariant,
}: {
  question: Question
  open: boolean
  handleClose: () => void
  currentVariant?: string
}) => {
  const { t } = useTranslation()

  const explanationToShow = pickQuestionExplanation(currentVariant, question, t)

  return (
    <HyModal
      open={open}
      onClose={handleClose}
      title={t('question:extrainfo')}
      footer={
        <HyButton variant="secondary" colour="black" onClick={handleClose}>
          {t('question:close')}
        </HyButton>
      }
    >
      <AppMarkdown>{explanationToShow}</AppMarkdown>
    </HyModal>
  )
}

export default ExtraInfoModalV2
