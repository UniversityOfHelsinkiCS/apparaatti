import { FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import { Question } from '../../common/types.tsx';

const FormQuestion = ({question}: {question: Question}) => {


  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
      {question.question.fi}
    </Typography>
      <RadioGroup name={question.id}>
        {
          question.options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={option.name.fi}
            />
          ))
        }
      </RadioGroup>
  </>
  );
}


export default FormQuestion;