import { Modal, Box, Typography, Button } from '@mui/material'
import { FC, Fragment, useEffect, useRef } from 'react'
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
  const filterContext = useFilterContext()
  const {
    filters,
    language,
    primaryLanguage,
    primaryLanguageSpecification,
  } = filterContext
  const { t } = useTranslation()
  const hasAutoClosedRef = useRef(false)
  const configMap = filterConfigMap(filterContext)

  const variantId = updateVariantToDisplayId(
    language,
    primaryLanguage,
    primaryLanguageSpecification
  )

  const buildFilter = (filter: Question, config: any) => {
    const state = config.state
    const setState = config.setState
    const displayType = config && config.displayType ? config.displayType : 'singlechoice'
    const superToggle = config && config.superToggle !== undefined ? config.superToggle : false
    const shortName = filter.shortName || filter.id

    return { ...filter, displayType, state, setState, superToggle, shortName }
  }

  const welcomeFilters = filters
    .map((question) => {
      const config = configMap.get(question.id)
      if (!config?.showInWelcomeModal) {
        return null
      }

      const variant = pickVariant(question, variantId)
      if (!shouldRenderWelcomeFilter(question.id, variant, language, primaryLanguage)) {
        return null
      }

      return { question, config, variant }
    })
    .filter((entry): entry is { question: Question; config: any; variant: any } => entry !== null)

  const mandatoryQuestionsAnswered = welcomeFilters.every((entry) => {
    if (!entry.question.mandatory) {
      return true
    }

    return isFilterStateAnswered(entry.config.state)
  })

  const renderWelcomeFilter = (entry: { question: Question; config: any; variant: any }) => {
    if (entry.question.id === 'study-field-select') {
      return <StudyPhaseQuestionV2 question={entry.question} />
    }

    if (entry.question.id === 'primary-language' || entry.question.id === 'lang') {
      return (
        <RadioQuestionV2
          question={entry.question}
          value={entry.config.state}
          setValue={entry.config.setState}
        />
      )
    }

    if (entry.question.id === 'primary-language-specification') {
      return <PrimaryLanguageSpecificationV2 question={entry.question} />
    }

    return (
      <Filter
        variant={entry.variant}
        filter={buildFilter(entry.question, entry.config)}
      />
    )
  }

  useEffect(() => {
    // Only auto-close once when questions are first completed
    if (mandatoryQuestionsAnswered && !hasAutoClosedRef.current && open) {
      onClose()
      hasAutoClosedRef.current = true
    }
  }, [mandatoryQuestionsAnswered, onClose, open])

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

        {welcomeFilters.map((entry) => (
          <Fragment key={entry.question.id}>
            {renderWelcomeFilter(entry)}
          </Fragment>
        ))}
        
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
            disabled={!mandatoryQuestionsAnswered}
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