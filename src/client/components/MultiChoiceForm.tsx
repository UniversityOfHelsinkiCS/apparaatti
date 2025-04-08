import React, { useState } from 'react';
import { Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import FormQuestion from './FormQuestion.tsx';
import { Form } from '../../common/types.ts';


const MultiChoiceForm = ({form}: {form: Form}) => {
  console.log(form)
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      alert(`You selected: ${selectedOption}`);
    } else {
      alert('Please select an option.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        gap: 2,
        maxWidth: 400,
        margin: '0 auto',
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
     
      <FormControl component="fieldset">
        {
          form != undefined ?
          form.questions.map((q) => {
            console.log(q)
            return( <FormQuestion key={q.id} question={q} selectedOption={selectedOption} handleOptionChange={handleOptionChange}/>)
          })
          :
          <></>
        }
         
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
};

export default MultiChoiceForm;
