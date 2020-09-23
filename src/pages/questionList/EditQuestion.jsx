import React, { useState, useEffect } from 'react';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

export default function EditQuestion({ question, save }) {
  const [newQuestion, updateNewQuestion] = useState(question);

  return (
  <Box mx={1}>
    <Box mb={4}>
      <FormControl>
        <InputLabel htmlFor="visibility-select">Visibility</InputLabel>
        <Select
            id="visibility-select" 
            value={newQuestion.visibility} 
            onChange={(e) => updateNewQuestion({...newQuestion, visibility: e.target.value}) } >
          <MenuItem value={1}>Private</MenuItem>
          <MenuItem value={2}>Shareable</MenuItem>
          <MenuItem value={3}>Public</MenuItem>
        </Select>
      </FormControl>
    </Box>

    <Box my={2} width={1/2}>
      <TextField 
        fullWidth
        value={newQuestion.metadata.name}
        onChange={(e) => updateNewQuestion({...newQuestion, metadata: {...newQuestion.metadata, name: e.target.value} }) }
        label="Name" variant="outlined" />
    </Box>

    <Box my={4}>
      <Button
        variant="contained"
        color="primary"
        onClick={ () => save(newQuestion) }>
        Save
      </Button>
    </Box>
  </Box>)
}
