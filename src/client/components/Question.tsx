import { FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import React from 'react';


const Question = ({selectedOption, handleOptionChange}: {selectedOption: string | null, handleOptionChange: (e: any) => void}) => {
  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
      Koen ruotsin kielentaitoni vahvaksi
    </Typography>
      <RadioGroup value={selectedOption} onChange={handleOptionChange}>
        <FormControlLabel value="1" control={<Radio />} label="heikko" />
        <FormControlLabel value="2" control={<Radio />} label="kohtalainen" />
        <FormControlLabel value="3" control={<Radio />} label="hyväksyttävä" />
        <FormControlLabel value="4" control={<Radio />} label="hyvä" />
        <FormControlLabel value="5" control={<Radio />} label="erinomainen" />
      </RadioGroup>
  </>
  );
}


export default Question;