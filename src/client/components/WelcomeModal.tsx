import { Box } from '@mui/material'
import { FC, Fragment, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Question, Variant } from '../../common/types'
import {
  filterConfigMap,
  FilterConfigMapType,
  isFilterStateAnswered,
  shouldRenderWelcomeFilter,
  useFilterContext,
} from '../contexts/filterContext'
import Filter from '../filters/filter'
import { pickVariant, updateVariantToDisplayId } from '../hooks/useQuestions'
import HyButton from './common/hy/HyButton'
import HyModal from './common/hy/HyModal'
import LanguageSelector from './LanguageSelector'
import RadioQuestionV2 from './RadioQuestionV2'
import StudyPhaseQuestionV2 from './StudyPhaseQuestionV2'

type WelcomeModalProps = {
  open: boolean
  onClose: () => void
  isAdmin?: boolean
}

const WelcomeModal: FC<WelcomeModalProps> = ({ open, onClose, isAdmin = false }) => {
  const filterContext = useFilterContext()
  const { filters, language, primaryLanguage, primaryLanguageSpecification } = filterContext
  const { t } = useTranslation()
  const configMap = filterConfigMap(filterContext)

  const variantId = updateVariantToDisplayId(language, primaryLanguage, primaryLanguageSpecification)

  const buildFilter = (filter: Question, config: FilterConfigMapType) => {
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

      const variant = pickVariant(question, variantId)

      if (!shouldRenderWelcomeFilter(question.id, variant, language, primaryLanguage)) {
        return null
      }

      if (!config || !variant) {
        return null
      }

      return { question, config, variant }
    })
    .filter(entry => entry !== null)

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

  const renderWelcomeFilter = (entry: { question: Question; config: FilterConfigMapType; variant: Variant }) => {
    const configState = entry.config.state

    if (entry.question.id === 'study-field-select') {
      return <StudyPhaseQuestionV2 question={entry.question} />
    }

    if ((entry.question.id === 'primary-language' || entry.question.id === 'lang') && !Array.isArray(configState)) {
      return <RadioQuestionV2 question={entry.question} value={configState} setValue={entry.config.setState} />
    }

    return <Filter variant={entry.variant} filter={buildFilter(entry.question, entry.config)} />
  }

  // autoclose when questions have been answered to
  useEffect(() => {
    if (open && welcomeFilters.length > 0 && allWelcomeQuestionsAnswered && !sessionStorage.getItem('hasVisitedV2')) {
      onClose()
    }
  }, [allWelcomeQuestionsAnswered, onClose, open, welcomeFilters.length])

  return (
    <HyModal
      open={open}
      onClose={handleCloseIfMandatoryAnswered}
      title={t('v2:welcomeText')}
      size="large"
      scrollable
      closeable={false}
      footer={
        <>
          <HyButton
            variant="primary"
            colour="blue"
            onClick={handleCloseIfMandatoryAnswered}
            disabled={!mandatoryQuestionsAnswered}
          >
            {t('v2:done')}
          </HyButton>
          {isAdmin && (
            <HyButton variant="secondary" colour="black" onClick={onClose}>
              {t('v2:skipQuestions')}
            </HyButton>
          )}
        </>
      }
    >
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LanguageSelector />
        </Box>

        {welcomeFilters.map(entry => (
          <Fragment key={entry.question.id}>{renderWelcomeFilter(entry)}</Fragment>
        ))}
      </Box>
    </HyModal>
  )
}

export default WelcomeModal
