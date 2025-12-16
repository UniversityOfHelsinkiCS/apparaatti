import { Box, MenuItem, Select } from '@mui/material'
import { useEffect, useState } from 'react'
import { Question, User } from '../../../common/types'
import { useTranslation } from 'react-i18next'
import { translateLocalizedString } from '../../util/i18n'
import QuestionTitleV2 from './QuestionTitleV2'
import ExtraInfoModalV2 from './ExtraInfoModalV2'
import { useFilterContext } from '../filterContext'

const StudyPhaseQuestionV2 = ({ question }: { question: Question }) => {
  const { user, studyData, supportedOrganisations, setUserOrgCode, studyField, setStudyField } = useFilterContext()
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const showAllOptions = (user: User | null) => {
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

  useEffect(() => {
    if (organisations && organisations.length > 0 && !studyField) {
      const initialValue = organisations[0].code
      setStudyField(initialValue)
      setUserOrgCode(initialValue)
    }
  }, [organisations, studyField, setStudyField, setUserOrgCode])

  if (!organisations) {
    return <p>no organisation found</p>
  }

  return (
    <Box sx={{ minWidth: 200, marginBottom: 2, paddingTop: 1 }}>
      <QuestionTitleV2 handleOpen={handleOpen} number={question.number} title={t('question:pickStudy')} question={question} />
      <ExtraInfoModalV2 question={question} open={open} handleClose={handleClose} />

      <Select
        sx={{
          padding: '1px',
          minWidth: 100,
          border: '1px solid lightgray',
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
export default StudyPhaseQuestionV2
