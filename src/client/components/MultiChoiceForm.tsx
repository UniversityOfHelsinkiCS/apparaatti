import React from 'react';
import { Box, Button, FormControl } from '@mui/material';
import FormQuestion from './FormQuestion.tsx';
import { Form } from '../../common/types.ts';


const MultiChoiceForm = ({ form, onSubmit }: {form: Form, onSubmit: (formData: FormData) => Promise<void>}) => {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
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
          {form.questions.map((q) => 
            <FormQuestion key={q.id} question={q}/>
          )}
        </FormControl>
        <Button
          variant="outlined"
          type="submit"
          sx={{
            borderColor: '#90caf9',
            color: 'black',
            '&:hover': {
              backgroundColor: '#2196f3',
              color: 'white',
            },
          }}
        >
          Submit
        </Button>
      </Box>
    </form>
  );
};

export default MultiChoiceForm;
