import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material'
import { Question } from '../../common/types'

const PreviuslyDoneLangQuestion = ({
  question,
  languageId,
}: {
  question: Question
  languageId: string
}) => {
  console.log('language id is: ', languageId)
  const variant = question.variants[0]
  const yesOption = variant.options.find((o) => o.id == '1')
  const noOption = variant.options.find((o) => o.id == '0')



  if(!yesOption || !noOption){
    return (<p>unkown error on question</p>)
  }

  return(
    <Box>
      <Typography>{variant.question.fi}</Typography>
      <RadioGroup name={question.id}>
              
        <FormControlLabel
          key={yesOption.id}
          value={yesOption.id}
          control={
            <Radio
              sx={{
                '&.Mui-checked': {
                  color: '#4caf50',
                },
              }}
            />
          }
          label={yesOption.name.fi}
          sx={{
            '&:hover': {
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
            },
          }}
        />
        <FormControlLabel
          key={noOption.id}
          value={noOption.id}
          control={
            <Radio
              sx={{
                '&.Mui-checked': {
                  color: '#4caf50',
                },
              }}
            />
          }
          label={noOption.name.fi}
          sx={{
            '&:hover': {
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
            },
          }}
        />

      </RadioGroup>


    </Box>
  )
}

export default PreviuslyDoneLangQuestion