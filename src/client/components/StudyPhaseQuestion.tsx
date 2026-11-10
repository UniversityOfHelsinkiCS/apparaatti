import { Box, type SelectChangeEvent } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LocalizedString, Question, User } from '../../common/types'
import { useFilterContext } from '../contexts/filterContext'
import { useFilterEditMode } from '../contexts/filterEditModeContext'
import { translateLocalizedString } from '../util/i18n'
import { HyMenuItem, HySelect } from './common/hy/HySelect'
import ExtraInfoModal from './ExtraInfoModal'
import QuestionTitle, { questionGroupName, questionTextId } from './QuestionTitle'

const StudyPhaseQuestion = ({ question, scope }: { question: Question; scope?: string }) => {
  const { user, studyData, supportedOrganisations, setUserOrgCode, studyField, setStudyField } = useFilterContext()
  // In edit mode the admin may preview the variant shared by all faculties ("mikä tahansa").
  const { isEditMode: allowAnyFaculty } = useFilterEditMode()
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const showAllOptions = (user: User | undefined) => {
    return user?.isAdmin ? true : false
  }

  const getOrganisations = () => {
    if (showAllOptions(user)) {
      return supportedOrganisations
    }
    return studyData?.organisations
  }
  const organisations = getOrganisations()

  const { t } = useTranslation()

  const handleChange = (e: SelectChangeEvent) => {
    setStudyField(e.target.value)
    setUserOrgCode(e.target.value)
  }

  if (!organisations) {
    return <p>{t('question:noOrganisation')}</p>
  }

  const anyLabel = t('v2:admin.backendLocales.anyValue')
  const organisationName = (code: string) => {
    const organisation = organisations.find((item: any) => item.code === code)
    return organisation ? translateLocalizedString(organisation.name as LocalizedString) : code
  }
  const isSingleChoice = organisations.length < 2 && !allowAnyFaculty

  return (
    <Box sx={{ minWidth: 200 }}>
      <QuestionTitle handleOpen={handleOpen} title={t('question:pickStudy')} question={question} scope={scope} />

      <ExtraInfoModal question={question} open={open} handleClose={handleClose} />

      <HySelect
        sx={{ minWidth: 100, maxWidth: '100%', marginTop: 1.5 }}
        disabled={isSingleChoice}
        name={questionGroupName(question.id, scope)}
        labelId={questionTextId(question.id, scope)}
        id={questionGroupName(question.id, scope)}
        data-testid="study-field-select"
        value={studyField}
        onChange={handleChange}
        displayEmpty={allowAnyFaculty}
        renderValue={allowAnyFaculty ? (code: string) => (code === '' ? anyLabel : organisationName(code)) : undefined}
      >
        {allowAnyFaculty && (
          <HyMenuItem value="" data-testid="study-field-option-any">
            {anyLabel}
          </HyMenuItem>
        )}
        {organisations?.map((item: any) => (
          <HyMenuItem key={item.id} value={item.code}>
            {translateLocalizedString(item.name)}
          </HyMenuItem>
        ))}
      </HySelect>
      {isSingleChoice && <input type="hidden" value={studyField} name={question.id} />}
    </Box>
  )
}
export default StudyPhaseQuestion
