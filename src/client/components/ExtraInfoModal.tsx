import { Box, Modal, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Question } from '../../common/types'
import Markdown from 'react-markdown'

const ExtraInfoModal = ({question, open, handleClose}: {question: Question, open: boolean, handleClose: () => void}) => {
  const {t} = useTranslation()
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #545454',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
  }

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
          {question.explanation || t('question:noExtraInfo')}
        </Markdown>
      </Box>
    </Modal>
  )

}


export default ExtraInfoModal
