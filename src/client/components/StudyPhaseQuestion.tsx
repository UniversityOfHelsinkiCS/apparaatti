import { Box, MenuItem, Select } from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Question, User } from '../../common/types'
import { useFilterContext } from '../contexts/filterContext'
import { translateLocalizedString } from '../util/i18n'
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

  const handleChange = (e: any) => {
    e.preventDefault()
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

      <Select
        sx={{
          padding: '1px',
          minWidth: 100,
          border: '1px solid lightgray',
          marginTop: 1.5,
        }}
        disabled={organisations.length < 2 ? true : false}
        name={question.id}
        labelId="study-field-select-label"
        id="study-field-select"
        data-cy="study-field-select"
        value={studyField}
        onChange={handleChange}
      >
        {organisations?.map((item: any) => (
          <MenuItem key={item.id} value={item.code}>
            {translateLocalizedString(item.name)}
          </MenuItem>
        ))}
      </Select>
      {organisations.length < 2 && <input type="hidden" value={studyField} name={question.id} />}
    </Box>
  )
}
export default StudyPhaseQuestion
