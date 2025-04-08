import React, { useState } from 'react';
import { Box, Button, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import FormQuestion from './FormQuestion.tsx';
import { Form } from '../../common/types.ts';


const MultiChoiceForm = ({form}: {form: Form}) => {
  console.log(form)
  

  const handleSubmit = () => {
    
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
            return( <FormQuestion key={q.id} question={q}/>)
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
