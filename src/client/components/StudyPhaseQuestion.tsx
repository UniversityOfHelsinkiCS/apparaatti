import { Box, MenuItem, Select, Typography } from '@mui/material'
import { useState } from 'react'
import { User } from '../../common/types'
import { useTranslation } from 'react-i18next'
import { translateLocalizedString } from '../util/i18n'
import Organisation from '../../server/db/models/organisation'

const StudyPhaseQuestion = ({ studyData, user, supportedOrganisations }: { studyData: any, user: User, supportedOrganisations: any }) => {
  console.log(user)
  const showAllOptions = (user: User) => {
    const groups = user?.hyGroupCn
    return groups?.includes('hy-kielikeskus-employees') ||  groups?.includes('grp-toska') 

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
  const {t, i18n} = useTranslation()
  const handleChange = (e) => {
    e.preventDefault()
    setSelectedValue(e.target.value)
  }

  if(!organisations){
    return (<p>no organisation found</p>)
  }
  return (
    <Box sx={{ minWidth: 200, marginBottom: 2 }}>
      
      <>
        <Typography id="study-field-select-label">
          {t('question:pickStudy')}
        </Typography>
       
        <Select
          sx={{
            padding: '1px',
            minWidth: 100,
            border: '1px solid lightgray',          
          }}
          disabled={organisations.length < 2 ? true : false} //makes drop down disabled if there is only one option to choose
          name="study-field-select"
          labelId="study-field-select-label"
          value={selectedValue}
          onChange={handleChange}
        >
          {organisations?.map((item: any) => (
            <MenuItem key={item.id} value={item.code}>
              {translateLocalizedString(item.name)}
            </MenuItem>
          ))}
        </Select>
        {organisations.length < 2 && <input type='hidden' value={selectedValue} name="study-field-select"/>}     
      </>
      
    </Box>
  )
}
export default StudyPhaseQuestion
