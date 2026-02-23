import { Modal, Box, Typography, Button } from '@mui/material'
import { FC, useEffect, useRef } from 'react'
import { useFilterContext } from './filterContext'
import PrimaryLanguageSpecificationV2 from './components/PrimaryLanguageSpecificationV2'
import { Question } from '../../common/types'
import RadioQuestionV2 from './components/RadioQuestionV2'
import StudyPhaseQuestionV2 from './components/StudyPhaseQuestionV2'
import { useTranslation } from 'react-i18next'

type Props = {
  open: boolean
  onClose: () => void
}

const style = {
  marginLeft: 'auto',
  marginRight: 'auto',
  width: {xs: '100vw', sm: '33vw'},
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
    studyField,
    primaryLanguageSpecification,
  } = useFilterContext()
  const { t } = useTranslation()
  const hasAutoClosedRef = useRef(false)

  const languageQuestion = filters.find((q) => q.id === 'lang')
  const primaryLanguageQuestion = filters.find((q) => q.id === 'primary-language')
  const studyPhaseQuestion = filters.find((q) => q.id === 'study-field-select')
  const primaryLanguageSpecificationQuestion = filters.find(
    (q) => q.id === 'primary-language-specification'
  )

  const checkShouldShowSpecification = () => {
    return language === primaryLanguage
  }
  const shouldShowSpecification = checkShouldShowSpecification()

  const allQuestionsAnswered =
    studyField &&
    primaryLanguage &&
    language &&
    (shouldShowSpecification ? primaryLanguageSpecification : true)

  useEffect(() => {
    // Only auto-close once when questions are first completed
    if (allQuestionsAnswered && !hasAutoClosedRef.current && open) {
      onClose()
      hasAutoClosedRef.current = true
    }
  }, [allQuestionsAnswered, onClose, open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{ border: 'none' }}
    >
      <Box sx={style}>
        <Typography sx={{ mb: 3 }}>
          {t('v2:welcomeText')}
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
        
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
            pb: '10vh',
          }}
        >
          <Button
            variant="contained"
            onClick={onClose}
            disabled={!allQuestionsAnswered}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1,
            }}
          >
            {t('v2:done')}
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default WelcomeModal