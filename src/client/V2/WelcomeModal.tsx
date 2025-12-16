import { Modal, Box, Typography } from '@mui/material'
import { FC } from 'react'
import { useFilterContext } from './filterContext'
import PrimaryLanguageSpecificationV2 from './components/PrimaryLanguageSpecificationV2'
import { Question } from '../../common/types'
import RadioQuestionV2 from './components/RadioQuestionV2'
import StudyPhaseQuestionV2 from './components/StudyPhaseQuestionV2'

type Props = {
  open: boolean
  onClose: () => void
}

const style = {
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '33vw',
  height: '100vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  border: 'none',
  overflowY: 'auto',
}

const WelcomeModal: FC<Props> = ({ open, onClose }) => {
  const {
    filters,
    language,
    setLanguage,
    primaryLanguage,
    setPrimaryLanguage,
  } = useFilterContext()

  const languageQuestion = filters.find((q) => q.id === 'lang')
  const primaryLanguageQuestion = filters.find((q) => q.id === 'primary-language')
  const studyPhaseQuestion = filters.find((q) => q.id === 'study-field-select')
  const primaryLanguageSpecificationQuestion = filters.find(
    (q) => q.id === 'primary-language-specification'
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ border: 'none' }}
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Welcome to Apparaatti!
        </Typography>
        <Typography>
          Please answer these questions to get better recommendations.
        </Typography>

        {studyPhaseQuestion && (
          <StudyPhaseQuestionV2 question={studyPhaseQuestion as Question} />
        )}
        {primaryLanguageQuestion && (
          <RadioQuestionV2
            question={primaryLanguageQuestion as Question}
            value={primaryLanguage}
            setValue={setPrimaryLanguage}
          />
        )}
        {languageQuestion && (
          <RadioQuestionV2
            question={languageQuestion as Question}
            value={language}
            setValue={setLanguage}
          />
        )}
        {primaryLanguageSpecificationQuestion && (
          <PrimaryLanguageSpecificationV2
            question={primaryLanguageSpecificationQuestion as Question}
          />
        )}
      </Box>
    </Modal>
  )
}

export default WelcomeModal