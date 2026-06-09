import { Modal, Box, Typography, Button } from '@mui/material'
import { FC, Fragment, useEffect, useRef } from 'react'
import BlackOutlinedButton from './common/BlackOutlinedButton'
import {
  filterConfigMap,
  isFilterStateAnswered,
  shouldRenderWelcomeFilter,
  useFilterContext,
} from '../contexts/filterContext'
import PrimaryLanguageSpecificationV2 from './PrimaryLanguageSpecificationV2'
import { Question } from '../../common/types'
import RadioQuestionV2 from './RadioQuestionV2'
import StudyPhaseQuestionV2 from './StudyPhaseQuestionV2'
import { useTranslation } from 'react-i18next'
import { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import Filter from '../filters/filter'
import LanguageSelector from './LanguageSelector'

type WelcomeModalProps = {
  open: boolean
  onClose: () => void
  isAdmin?: boolean
}

const style = {
  marginLeft: 'auto',
  marginRight: 'auto',
  width: { xs: '100vw', sm: '33vw' },
  height: '100vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  border: 'none',
  overflowY: 'auto',
}

const WelcomeModal: FC<WelcomeModalProps> = ({ open, onClose, isAdmin = false }) => {
  const filterContext = useFilterContext()
  const { filters, language, primaryLanguage, primaryLanguageSpecification } = filterContext
  const { t } = useTranslation()
  const hasAutoClosedRef = useRef(false)
  const configMap = filterConfigMap(filterContext)

  const variantId = updateVariantToDisplayId(language, primaryLanguage, primaryLanguageSpecification)

  const buildFilter = (filter: Question, config: any) => {
    const state = config.state
    const setState = config.setState
    const displayType = filter.displayType ?? 'singlechoice'
    const superToggle = filter.superToggle ?? false
    const shortName = filter.shortName ?? filter.id

    return { ...filter, displayType, state, setState, superToggle, shortName }
  }

  const welcomeFilters = filters
    .map(question => {
      const config = configMap.get(question.id)
      if (!question.showInWelcomeModal) {
        return null
      }

      const variant = pickVariant(question, variantId) ?? null
      if (!shouldRenderWelcomeFilter(question.id, variant, language, primaryLanguage)) {
        return null
      }

      return { question, config, variant }
    })
    .filter((entry): entry is { question: Question; config: any; variant: any } => entry !== null)

  const allWelcomeQuestionsAnswered = welcomeFilters.every(entry => {
    if (!entry.config) {
      return true
    }

    return isFilterStateAnswered(entry.config.state)
  })

  const mandatoryQuestionsAnswered = welcomeFilters.every(entry => {
    if (!entry.config) {
      return true
    }

    if (!entry.question.mandatory) {
      return true
    }

    return isFilterStateAnswered(entry.config.state)
  })

  const handleCloseIfMandatoryAnswered = () => {
    if (!mandatoryQuestionsAnswered) {
      return
    }

    onClose()
  }

  const renderWelcomeFilter = (entry: { question: Question; config: any; variant: any }) => {
    if (entry.question.id === 'study-field-select') {
      return <StudyPhaseQuestionV2 question={entry.question} />
    }

    if (entry.question.id === 'primary-language' || entry.question.id === 'lang') {
      return <RadioQuestionV2 question={entry.question} value={entry.config.state} setValue={entry.config.setState} />
    }

    if (entry.question.id === 'primary-language-specification') {
      return <PrimaryLanguageSpecificationV2 question={entry.question} />
    }

    return <Filter variant={entry.variant} filter={buildFilter(entry.question, entry.config)} />
  }

  useEffect(() => {
    if (open && welcomeFilters.length > 0 && allWelcomeQuestionsAnswered && !hasAutoClosedRef.current) {
      onClose()
      hasAutoClosedRef.current = true
    }
  }, [allWelcomeQuestionsAnswered, onClose, open, welcomeFilters.length])

  return (
    <Modal
      open={open}
      onClose={handleCloseIfMandatoryAnswered}
      aria-labelledby="modal-modal-title"
      sx={{ border: 'none' }}
    >
      <Box sx={style}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <LanguageSelector />
        </Box>

        <Typography id="modal-modal-title" component="h2" variant="h5" sx={{ mb: 3 }}>
          {t('v2:welcomeText')}
        </Typography>

        {welcomeFilters.map(entry => (
          <Fragment key={entry.question.id}>{renderWelcomeFilter(entry)}</Fragment>
        ))}

        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            pb: '10vh',
          }}
        >
          <Button
            variant="contained"
            onClick={handleCloseIfMandatoryAnswered}
            disabled={!mandatoryQuestionsAnswered}
            sx={{
              textTransform: 'none',
              px: 4,
              py: 1,
            }}
          >
            {t('v2:done')}
          </Button>
          {isAdmin && <BlackOutlinedButton onClick={onClose}>{t('v2:skipQuestions')}</BlackOutlinedButton>}
        </Box>
      </Box>
    </Modal>
  )
}

export default WelcomeModal
