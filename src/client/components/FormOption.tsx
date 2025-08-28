import { FormControlLabel, Radio } from '@mui/material'

const FormOption = ({id, value, label, dataCy}: {id: string, value: string, label: string, dataCy: string}) => {
  return (
    
    <FormControlLabel
      key={id}
      value={value}
      data-cy={dataCy}
      control={
        <Radio
          sx={{
            '&.Mui-checked': {
              color: '#4caf50',
            },
          }}
        />
      }
      label={label}
      sx={{
        '&:hover': {
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
        },
      }}
    />

  )
}

export default FormOption
