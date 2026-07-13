import { IconButton, Stack, Typography } from '@mui/material'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Question } from '../../common/types'
import HyTag from './common/hy/HyTag'

const MandatoryStatus = ({ question }: { question: Question }) => {
  const { t } = useTranslation()
  if (!question.mandatory) {
    return <></>
  }
  return <HyTag text={t('question:mandatory')} colour="attention" ariaHidden={false} sx={{ mr: 0.5 }} />
}

const QuestionTitle = ({
  handleOpen,
  title,
  question,
  showMandatoryStatus = true,
}: {
  handleOpen: () => void
  title: string | undefined
  question: Question
  showMandatoryStatus?: boolean
}) => {
  return (
    <Stack data-cy={`question-title-${question.id}`} sx={{ gap: 0.75 }}>
      {showMandatoryStatus && (
        <Stack direction="row">
          <MandatoryStatus question={question} />
        </Stack>
      )}
      <Stack direction="row" sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          onClick={handleOpen}
          aria-label="more info"
          sx={{ padding: 0.5, marginRight: 0.5, marginLeft: -0.5, marginY: 'auto' }}
        >
          <Info />
        </IconButton>
        <Typography sx={{ fontSize: '1rem', width: 'auto' }} data-cy={`question-text-${question.id}`}>
          {title}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default QuestionTitle
