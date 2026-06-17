import { Box, Modal, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Markdown from 'react-markdown'

import { Question } from '../../common/types'
import { pickQuestionExplanation } from '../hooks/useQuestions'
import ActionButtonV2 from './common/ActionButtonV2'

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
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90vw', sm: '70vw', md: '60vw' },
    bgcolor: 'background.paper',
    border: '2px solid #545454',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
  }

  const explanationToShow = pickQuestionExplanation(currentVariant, question, t)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {t('question:extrainfo')}
        </Typography>
        <Markdown>{explanationToShow}</Markdown>

        <ActionButtonV2 onClick={handleClose} text={t('question:close')}></ActionButtonV2>
      </Box>
    </Modal>
  )
}

export default ExtraInfoModalV2
