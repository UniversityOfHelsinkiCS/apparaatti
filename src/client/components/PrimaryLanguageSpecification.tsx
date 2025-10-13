import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Modal,
} from '@mui/material'
import { Question } from '../../common/types.ts'
import React from 'react'
import QuestionTitle from './questionTitle.tsx'
const PrimaryLanguageSpecificationQuestion  = ({
  question,
  language,
  primaryLanguage,
  setPrimaryLanguageSpecification
}: {
  question: Question
  language: string,
  primaryLanguage: string
  setPrimaryLanguageSpecification: (spec: string) => void 
}) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const checkShouldShow = () => {
    //english is not split into spoken or written yet so return false
    if(language === '' || language === 'en'){
      return false
    }
    return language === primaryLanguage
  }
  const shouldShow: boolean = checkShouldShow()// when the user chooses fi=fi it means he/she is looking for a primary language and we need this question to be shown
  const variant = question.variants[0]
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #545454',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
  }
  const handleChange = (e: any) => {
    setPrimaryLanguageSpecification(e.target.value)
  }
  if(!shouldShow){
    return(<></>)
  }
  return (
    <Box
      sx={{

        paddingTop: 4,
      }}
    >
      <QuestionTitle number={question.number} handleOpen={handleOpen} title={variant.question} question={question}/>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Lisätietoa
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {question.explanation ? question.explanation : 'Ei lisätietoa'}
          </Typography>
        </Box>
      </Modal>

      <RadioGroup name={question.id} onChange = {handleChange}>
        {variant.options.map((option) => (
          <FormControlLabel
            key={option.id}
            value={option.id}
            data-cy={`${question.id}-option-${option.id}`}
            control={
              <Radio
                sx={{
                  '&.Mui-checked': {
                    color: '#4caf50',
                  },
                }}
              />
            }
            label={option.name}
            sx={{
              '&:hover': {
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
              },
            }}
          />
        ))}
      </RadioGroup>
    </Box>
  )
}

export default PrimaryLanguageSpecificationQuestion
