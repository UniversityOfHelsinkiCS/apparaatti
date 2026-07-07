import { Box, Stack } from '@mui/material'
import { FC, Fragment, useEffect, useRef } from 'react'
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
import RadioQuestion from './RadioQuestion'
import StudyPhaseQuestion from './StudyPhaseQuestion'

type WelcomeModalProps = {
  open: boolean
  onClose: () => void
  isAdmin?: boolean
}

const WelcomeModal: FC<WelcomeModalProps> = ({ open, onClose, isAdmin = false }) => {
  const prevOpenRef = useRef(false)
  const autoCloseEnabledRef = useRef(false)
  const filterContext = useFilterContext()
  const { filters, language, primaryLanguage, primaryLanguageSpecification } = filterContext
  const { t } = useTranslation()
  const configMap = filterConfigMap(filterContext)

  const variantId = updateVariantToDisplayId(language, primaryLanguage, primaryLanguageSpecification)

  const buildFilter = (filter: Question, config: FilterConfigMapType) => {
    const state = config.state
    const setState = config.setState
    const displayType = filter.displayType ?? 'singlechoice'
    const shortName = filter.shortName ?? filter.id

    return { ...filter, displayType, state, setState, shortName }
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
    return isFilterStateAnswered(entry.config.state)
  })

  const mandatoryQuestionsAnswered = welcomeFilters.every(entry => {
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
      return <StudyPhaseQuestion question={entry.question} />
    }

    if ((entry.question.id === 'primary-language' || entry.question.id === 'lang') && !Array.isArray(configState)) {
      return <RadioQuestion question={entry.question} value={configState} setValue={entry.config.setState} />
    }

    return <Filter variant={entry.variant} filter={buildFilter(entry.question, entry.config)} />
  }

  // autoclose when questions have been answered to, but not if modal opened with questions already answered
  useEffect(() => {
    const wasOpen = prevOpenRef.current
    prevOpenRef.current = open

    if (!wasOpen && open) {
      autoCloseEnabledRef.current = !allWelcomeQuestionsAnswered
    } else if (!open) {
      autoCloseEnabledRef.current = false
    }

    if (open && welcomeFilters.length > 0 && allWelcomeQuestionsAnswered && autoCloseEnabledRef.current) {
      autoCloseEnabledRef.current = false
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
      closeable={mandatoryQuestionsAnswered}
      showCloseButton={false}
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
        <LanguageSelector sx={{ position: 'absolute', top: '16px', right: '16px' }} />

        <Stack spacing={3}>
          {welcomeFilters.map(entry => (
            <Fragment key={entry.question.id}>{renderWelcomeFilter(entry)}</Fragment>
          ))}
        </Stack>
      </Box>
    </HyModal>
  )
}

export default WelcomeModal
