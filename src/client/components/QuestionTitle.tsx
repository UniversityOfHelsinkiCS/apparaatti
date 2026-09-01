import { Stack, Typography } from '@mui/material'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Language, Question } from '../../common/types'
import { foreignLanguage } from '../util/contentLanguage'
import HyIconButton from './common/hy/HyIconButton'
import HyTag from './common/hy/HyTag'
import { hy } from './common/hy/hyTokens'

const MandatoryStatus = ({ question }: { question: Question }) => {
  const { t } = useTranslation()
  if (!question.mandatory) {
    return <></>
  }
  return <HyTag text={t('question:mandatory')} colour="attention" sx={{ mr: 0.5 }} />
}

const QuestionTitle = ({
  handleOpen,
  title,
  titleLanguage,
  question,
  showMandatoryStatus = true,
}: {
  handleOpen: () => void
  title: string | undefined
  titleLanguage?: Language
  question: Question
  showMandatoryStatus?: boolean
}) => {
  const { t, i18n } = useTranslation()
  const titleLang = foreignLanguage(titleLanguage, i18n.resolvedLanguage ?? i18n.language)

  return (
    <Stack data-testid={`question-title-${question.id}`} sx={{ gap: 0.75 }}>
      {showMandatoryStatus && (
        <Stack direction="row">
          <MandatoryStatus question={question} />
        </Stack>
      )}
      <Stack direction="row" sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          sx={{ fontSize: '1rem', width: 'auto' }}
          id={`question-text-${question.id}`}
          data-testid={`question-text-${question.id}`}
          lang={titleLang}
        >
          {title}
        </Typography>
        <HyIconButton
          onClick={handleOpen}
          aria-label={t('question:extrainfo')}
          sx={{ order: -1, marginRight: '6px', marginY: 'auto', color: hy.iconColor.neutral }}
        >
          <Info />
        </HyIconButton>
      </Stack>
    </Stack>
  )
}

export default QuestionTitle
