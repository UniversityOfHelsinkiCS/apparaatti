import { Box, type SelectChangeEvent } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Question, User } from '../../common/types'
import { useFilterContext } from '../contexts/filterContext'
import { translateLocalizedString } from '../util/i18n'
import { HyMenuItem, HySelect } from './common/hy/HySelect'
import ExtraInfoModal from './ExtraInfoModal'
import QuestionTitle from './QuestionTitle'

const StudyPhaseQuestion = ({ question }: { question: Question }) => {
  const { user, studyData, supportedOrganisations, setUserOrgCode, studyField, setStudyField } = useFilterContext()
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
    return <p>no organisation found</p>
  }

  return (
    <Box sx={{ minWidth: 200 }}>
      <QuestionTitle handleOpen={handleOpen} title={t('question:pickStudy')} question={question} />

      <ExtraInfoModal question={question} open={open} handleClose={handleClose} />

      <HySelect
        sx={{ minWidth: 100, maxWidth: '100%', marginTop: 1.5 }}
        disabled={organisations.length < 2}
        name={question.id}
        labelId="study-field-select-label"
        id="study-field-select"
        data-testid="study-field-select"
        value={studyField}
        onChange={handleChange}
      >
        {organisations?.map((item: any) => (
          <HyMenuItem key={item.id} value={item.code}>
            {translateLocalizedString(item.name)}
          </HyMenuItem>
        ))}
      </HySelect>
      {organisations.length < 2 && <input type="hidden" value={studyField} name={question.id} />}
    </Box>
  )
}
export default StudyPhaseQuestion
