import { Box, MenuItem, Select } from '@mui/material'
import { useEffect, useState } from 'react'
import { Question, User } from '../../../common/types'
import { translateLocalizedString } from '../../util/i18n'

const StudyPhaseFilter = ({
  filter,
  studyData,
  user,
  supportedOrganisations,
  setUserOrgCode,
}: {
  filter: Question
  studyData: any
  user: User | null
  supportedOrganisations: any
  setUserOrgCode: (code: string) => void
}) => {
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

  const startValue = () => {
    if (!organisations) {
      return null
    }
    const selectedField = organisations[0]
    return selectedField.code
  }

  const [selectedValue, setSelectedValue] = useState(startValue())

  const handleChange = (e) => {
    e.preventDefault()
    setSelectedValue(e.target.value)
  }

  useEffect(() => {
    setUserOrgCode(selectedValue)
  }, [selectedValue])

  if (!organisations) {
    return <p>no organisation found</p>
  }

  return (
    <Box sx={{ minWidth: 200 }}>
      <Select
        sx={{
          padding: '1px',
          minWidth: 100,
          border: '1px solid lightgray',
        }}
        disabled={organisations.length < 2 ? true : false}
        name={filter.id}
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
      {organisations.length < 2 && (
        <input type="hidden" value={selectedValue} name={filter.id} />
      )}
    </Box>
  )
}

export default StudyPhaseFilter
