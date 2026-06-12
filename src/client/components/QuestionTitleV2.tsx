import { IconButton, Stack, Typography } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { Question } from '../../common/types'
import MandatoryBadge from './common/MandatoryBadge'

const MandatoryStatus = ({ question }: { question: Question }) => {
  if (!question.mandatory) {
    return <></>
  }
  return <MandatoryBadge />
}

const QuestionTitleV2 = ({
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
          <InfoIcon />
        </IconButton>
        <Typography sx={{ fontSize: '1rem', width: 'auto' }} data-cy={`question-text-${question.id}`}>
          {title}
        </Typography>
      </Stack>
    </Stack>
  )
}

export default QuestionTitleV2
