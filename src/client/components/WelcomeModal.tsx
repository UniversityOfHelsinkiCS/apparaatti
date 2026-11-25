import { Box, Stack } from '@mui/material'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import { isFilterStateAnswered } from '../contexts/filter/filterState'
import { resolveRenderableFilter } from '../contexts/filter/renderableFilter'
import { useFilterContext } from '../contexts/filterContext'
import { useFilterEditMode } from '../contexts/filterEditModeContext'
import useModalLabels from '../hooks/useModalLabels'
import { canCloseWelcomeModal } from '../util/editModeAnswers'
import HyButton from './common/hy/HyButton'
import HyModal from './common/hy/HyModal'
import LanguageSelector from './LanguageSelector'
import QuestionBody from './QuestionBody'

type WelcomeModalProps = {
  open: boolean
  onClose: () => void
  isAdmin?: boolean
}

const WelcomeModal: FC<WelcomeModalProps> = ({ open, onClose, isAdmin = false }) => {
  const filterContext = useFilterContext()
  const { filters, variantQuery } = filterContext
  const { isEditMode } = useFilterEditMode()
  const { t } = useTranslation()
  const modalLabels = useModalLabels()

  const welcomeFilters = filters
    .map(question => {
      if (!question.showInWelcomeModal) {
        return null
      }

      const entry = resolveRenderableFilter(question, filterContext)

      if (!entry || !entry.config) {
        return null
      }

      return entry
    })
    .filter(entry => entry !== null)

  const mandatoryQuestionsAnswered = welcomeFilters.every(entry => {
    if (!entry.question.mandatory) {
      return true
    }

    return isFilterStateAnswered(entry.filterToRender.state)
  })
  const canClose = canCloseWelcomeModal({ isEditMode, mandatoryQuestionsAnswered })

  const handleCloseIfMandatoryAnswered = () => {
    if (!canClose) {
      return
    }

    onClose()
  }

  return (
    <HyModal
      open={open}
      onClose={handleCloseIfMandatoryAnswered}
      labels={modalLabels}
      title={t('v2:welcomeText')}
      size="large"
      scrollable
      closeable={canClose}
      showCloseButton={false}
      footer={
        <>
          <HyButton variant="primary" colour="blue" onClick={handleCloseIfMandatoryAnswered} disabled={!canClose}>
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
            <Fragment key={entry.question.id}>
              <QuestionBody entry={entry} variantQuery={variantQuery} scope="welcome" />
            </Fragment>
          ))}
        </Stack>
      </Box>
    </HyModal>
  )
}

export default WelcomeModal
