import { useTranslation } from 'react-i18next'
import { Question } from '../../common/types'
import Markdown from 'react-markdown'
import { pickQuestionExplanation } from '../hooks/useQuestions'
import DsButton from './common/DsButton'

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
    <ds-modal
      ds-open={open}
      ds-heading-text={t('question:extrainfo')}
      ds-size="medium"
      ds-scrollable={true}
      ondsModalClose={handleClose}
    >
      <div slot="content">
        <Markdown>{explanationToShow}</Markdown>
      </div>
      <div slot="footer">
        <DsButton text={t('question:close')} variant="secondary" onClick={handleClose} />
      </div>
    </ds-modal>
  )
}

export default ExtraInfoModalV2
