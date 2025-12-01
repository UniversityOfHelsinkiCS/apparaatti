import { Box, MenuItem, Select } from '@mui/material'
import { useEffect, useState } from 'react'
import { Question, User } from '../../common/types'
import { useTranslation } from 'react-i18next'
import { translateLocalizedString } from '../util/i18n'

import QuestionTitle from './questionTitle'
import ExtraInfoModal from './ExtraInfoModal'


const StudyPhaseQuestion = ({ question, studyData, user, supportedOrganisations, setUserOrgCode }: {question: Question, studyData: any, user: User, supportedOrganisations: any, setUserOrgCode: (code: string) => void }) => {
  
  console.log(user)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const showAllOptions = (user: User) => {
    return user?.isAdmin ? true : false

  }
  const getOrgansations = () => {
    //its ok to do this check on the client side since organisations is public anyways
    if (showAllOptions(user)){
      return supportedOrganisations
    }
    return studyData?.organisations
  }
  const organisations = getOrgansations()

  const startValue = () => {   
    console.log(organisations)
    if(!organisations){
      return null
    }
    const selectedField = organisations[0]
    return selectedField.code
  }
  const [selectedValue, setSelectedValue] = useState(startValue())
  const {t} = useTranslation()
  const handleChange = (e) => {
    e.preventDefault()
    setSelectedValue(e.target.value)
  }
  useEffect(() => {
    setUserOrgCode(selectedValue)
  }, [selectedValue])
  if(!organisations){
    return (<p>no organisation found</p>)
  }

  return (
    <Box sx={{ minWidth: 200, marginBottom: 2 }}>
      <QuestionTitle handleOpen={handleOpen} number={question.number} title={t('question:pickStudy')} question={question}/>
      <ExtraInfoModal question={question} open={open} handleClose={handleClose}/>
   
      <Select
        sx={{
          padding: '1px',
          minWidth: 100,
          border: '1px solid lightgray',          
        }}
        disabled={organisations.length < 2 ? true : false} //makes drop down disabled if there is only one option to choose
        name={question.id}
        labelId="study-field-select-label"
        id="study-field-select"
        data-cy="study-field-select"
        value={selectedValue}
        onChange={handleChange}
      >
        {organisations?.map((item: any) => (
          <MenuItem key={item.id} value={item.code}>
            {translateLocalizedString(item.name)}
          </MenuItem>
        ))}
      </Select>
      {organisations.length < 2 && <input type='hidden' value={selectedValue} name={question.id}/>}     
      
    </Box>
  )
}
export default StudyPhaseQuestion
