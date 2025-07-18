import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Modal,
} from '@mui/material'
import { Question } from '../../common/types.tsx'
import React from 'react'
import QuestionTitle from './questionTitle.tsx'
const FormQuestion = ({
  question,
  languageId,
}: {
  question: Question
  languageId: string
}) => {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const pickVariant = () => {
    if (languageId === '2') {
      if (question.variants[1]) {
        const v = question.variants.find((v) => v.name == 'onlyFi')
        if (v) {
          return v
        } else {
          return question.variants[0]
        }
      } else {
        return question.variants[0]
      }
    } else if (languageId === '3') {
      if (question.variants[1]) {
        const v = question.variants.find((v) => v.name == 'onlySe')
        if (v) {
          return v
        } else {
          return question.variants[0]
        }
      } else {
        return question.variants[0]
      }
    } else if (languageId === '4') {
      if (question.variants[1]) {
        const v = question.variants.find((v) => v.name == 'onlyEn')
        if (v) {
          return v
        } else {
          return question.variants[0]
        }
      } else {
        return question.variants[0]
      }
    } else {
      return question.variants[0]
    }
  }

  const variant = pickVariant()

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
  return (
    <Box
      sx={{
        paddingTop: 4,
      }}
    >
      <QuestionTitle handleOpen={handleOpen} title={variant.question.fi}/>
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

      <RadioGroup name={question.id}>
        {variant.options.map((option) => (
          <FormControlLabel
            key={option.id}
            value={option.id}
            control={
              <Radio
                sx={{
                  '&.Mui-checked': {
                    color: '#4caf50',
                  },
                }}
              />
            }
            label={option.name.fi}
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

export default FormQuestion
