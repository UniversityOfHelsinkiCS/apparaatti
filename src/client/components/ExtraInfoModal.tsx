import { Box, Modal, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Question } from '../../common/types'
import Markdown from 'react-markdown'
import ActionButton from './actionButton'

const ExtraInfoModal = ({question, open, handleClose, currentVariant}: {question: Question, open: boolean, handleClose: () => void, currentVariant?: string}) => {
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

  const pickExplanation = () => {
    if(currentVariant){
      const explanationVariant = question.variants.find((v) => v.name === currentVariant)
      if(explanationVariant?.explanation){
        return explanationVariant.explanation
      }
    }

    return question.explanation || t('question:noExtrainfo')
  }
  const explanationToShow = pickExplanation()

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

        <ActionButton onClick={handleClose} text={t('question:close')}></ActionButton>
      </Box>
    </Modal>
  )

}


export default ExtraInfoModal
