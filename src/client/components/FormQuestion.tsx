import { FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Form, Question } from '../../common/types.tsx';


const FormQuestion = ({question}: {question: Question}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
      {question.question.fi}
    </Typography>
      <RadioGroup value={selectedOption} onChange={handleOptionChange}>
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