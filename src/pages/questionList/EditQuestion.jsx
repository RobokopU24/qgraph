import React, { useState, useContext, useEffect } from 'react';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import LinkIcon from '@material-ui/icons/Link';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ShareIcon from '@material-ui/icons/Share';
import DescriptionIcon from '@material-ui/icons/Description';

import API from '@/API';
import UserContext from '@/user';

export default function EditQuestion({ question, onQuestionUpdated }) {
  const [newQuestion, updateNewQuestion] = useState(question);
  const user = useContext(UserContext);

  function save() {
    API.updateQuestionFields(newQuestion, user.id_token);
    onQuestionUpdated();
  }

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
        onClick={ () => save() }>
        Save
      </Button>
    </Box>

    <Box mt={6} mb={4}>
      <Typography variant="h4">
        Actions
      </Typography>
    </Box>

    <Box my={2}>
      <Button
        startIcon={<LinkIcon />}
        variant="contained"
        size="large"
        color="secondary"
        onClick={ () => 0 }>
        Get Shareable Link
      </Button>
    </Box>

    <Box my={2}>
      <Button
        startIcon={<DeleteOutlineIcon />}
        variant="contained"
        size="large"
        color="secondary"
        onClick={ () => 0 }>
        Delete
      </Button>
    </Box>

    <Box my={2}>
      <Button
        startIcon={<ShareIcon />}
        variant="contained"
        size="large"
        color="secondary"
        onClick={ () => 0 }>
        Fork
      </Button>
    </Box>

    <Box my={2}>
      <Button
        startIcon={<DescriptionIcon />}
        variant="contained"
        size="large"
        color="secondary"
        onClick={ () => 0 }>
        Download JSON
      </Button>
    </Box>

  </Box>)
}
