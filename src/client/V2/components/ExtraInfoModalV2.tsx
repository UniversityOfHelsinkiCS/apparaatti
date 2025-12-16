import { Box, Modal, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Question } from '../../../common/types'
import Markdown from 'react-markdown'
import ActionButtonV2 from './ActionButtonV2'
import { pickQuestionExplanation } from '../../hooks/useQuestions'

const ExtraInfoModalV2 = ({question, open, handleClose, currentVariant}: {question: Question, open: boolean, handleClose: () => void, currentVariant?: string}) => {
  const {t} = useTranslation()
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60vw',
    bgcolor: 'background.paper',
    border: '2px solid #545454',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
  }

  
  const explanationToShow = pickQuestionExplanation(currentVariant, question, t)

  return(
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
        <Markdown>
          {explanationToShow}
        </Markdown>

        <ActionButtonV2 onClick={handleClose} text={t('question:close')}></ActionButtonV2>
      </Box>
    </Modal>
  )

}


export default ExtraInfoModalV2
