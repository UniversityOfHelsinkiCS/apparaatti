import React from 'react'
import {
  Box,
  FormControlLabel,
  Modal,
  Typography,
  Checkbox,
  FormGroup,
  FormControl,
} from '@mui/material'
import { green } from '@mui/material/colors'
import { Question } from '../../common/types'
import QuestionTitle from './questionTitle'

const PeriodQuestion = ({ question }: { question: Question }) => {
  const [open, setOpen] = React.useState(false)
 

  const [state, setState] = React.useState({
    intensive_3_previous: false,
    period_1: false,
    period_2: false,
    period_3: false,
    period_4: false,
    intensive_3: false,
  })

  //const [ year, setYear ] = React.useState('')
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const variant = question.variants[0]

  const handleChoice = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked })
  }
 

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
      <QuestionTitle handleOpen={handleOpen} title={variant.question}/>
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

      <FormControl sx={{m: 0, display: 'flex'}} component="fieldset" variant="standard">
        <FormGroup>
          {question.variants[0].options.map((option) => (
            <FormControlLabel
              key={option.id}
              name={question.id}
              value={option.id}
              sx={{
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                },
              }}
              control={
                <Checkbox
                  
                  
                 
                  onChange={handleChoice}
                  color="default"
                  sx={{ '&.Mui-checked': { color: green[500] } }}
                />
              }
              label={option.name}
            />
          ))}
         
        </FormGroup>
      </FormControl>
    </Box>
  )
}

export default PeriodQuestion
