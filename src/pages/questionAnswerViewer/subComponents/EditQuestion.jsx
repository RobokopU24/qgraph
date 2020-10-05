import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import slugify from 'slugify';

import { DataGrid } from '@material-ui/data-grid';

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

import API from '@/API';
import UserContext from '@/user';
import ClipboardButton from '@/components/shared/ClipboardButton';
import NewDownloadButton from '@/components/shared/NewDownloadButton';

import { formatDateTimeNicely } from '@/utils/cache';

export default function EditQuestion({ question, onUpdated, onDeleted }) {
  const history = useHistory();

  const fullLocation = `${window.location.origin}/question/${question.id}`;

  const [newQuestion, updateNewQuestion] = useState(question);
  const user = useContext(UserContext);

  let token;
  if (user) {
    token = user.id_token;
  }

  async function save() {
    if (!newQuestion.metadata.name) {
      return;
    }
    const response = await API.updateQuestion(newQuestion, token);
    onUpdated(response);
  }

  async function handleDelete() {
    const response = await API.deleteQuestion(question.id, token);
    onDeleted(response);
  }

  const [historicAnswers, updateHistoricAnswers] = useState([]);

  async function fetchHistoricAnswers() {
    const response = await API.getAnswersByQuestion(question.id, token);
    if (response.status === 'error') {
      return;
    }
    const answers = response;

    // Spread metadata object so that we don't have nested keys
    // when rendering in DataGrid
    updateHistoricAnswers(answers.map((a) => ({ ...a.metadata, ...a })));
  }

  useEffect(() => { fetchHistoricAnswers(); }, [user]);

  function questionFileName() {
    const question_name_slug = slugify(question.metadata.name, '_',
      { strict: true });
    return `${question_name_slug}.json`;
  }

  function handleNameUpdate(e) {
    updateNewQuestion(
      {
        ...newQuestion,
        metadata: { ...newQuestion.metadata, name: e.target.value },
      },
    );
  }

  return (
    <Box mx={1}>

      <Box my={3}>
        <TextField
          error={!newQuestion.metadata.name}
          helperText={!newQuestion.metadata.name && 'This field is required'}
          fullWidth
          value={newQuestion.metadata.name}
          onChange={handleNameUpdate}
          disabled={!question.owned}
          label="Name"
          variant="outlined"
        />
      </Box>

      <Box my={4}>
        <FormControl>
          <InputLabel htmlFor="visibility-select">Visibility</InputLabel>
          <Select
            id="visibility-select"
            value={newQuestion.visibility}
            inputProps={{ disabled: !question.owned }}
            onChange={(e) => updateNewQuestion({ ...newQuestion, visibility: e.target.value })}
          >
            <MenuItem value={1}>Private</MenuItem>
            <MenuItem value={2}>Shareable</MenuItem>
            <MenuItem value={3}>Public</MenuItem>
          </Select>
        </FormControl>
      </Box>

      { question.owned && (
        <Box my={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={save}
          >
            Save
          </Button>
        </Box>
      )}

      <Box mt={6} mb={4}>
        <Typography variant="h4">
          Actions
        </Typography>
      </Box>

      <Box my={2}>
        <ClipboardButton
          startIcon={<LinkIcon />}
          displayText="Get Shareable Link"
          notificationText="Shareable link copied to clipboard"
          clipboardText={fullLocation}
        />
      </Box>

      { question.owned && (
        <Box my={2}>
          <Button
            startIcon={<DeleteOutlineIcon />}
            variant="contained"
            size="large"
            color="secondary"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      )}

      <Box my={2}>
        <Button
          disabled
          startIcon={<ShareIcon />}
          variant="contained"
          size="large"
          color="secondary"
          onClick={() => 0}
        >
          Fork
        </Button>
      </Box>

      <Box my={2}>
        <NewDownloadButton
          displayText="Download JSON"
          getData={() => API.getQuestionData(question.id, token)}
          fileName={questionFileName}
        />
      </Box>

      <Box mt={6} mb={4}>
        <Typography variant="h4">
          Answers
        </Typography>
      </Box>

      <DataGrid
        onRowClick={(param) => history.push(`/answer/${param.id}`)}
        autoHeight
        justify="center"
        columns={[
          { field: 'id', hide: true },
          {
            field: 'created_at',
            headerName: 'Date',
            width: '50%',
            valueGetter: (params) => formatDateTimeNicely(params.value),
          },
          { field: 'status', headerName: 'Status', width: '50%' },
        ]}
        rows={historicAnswers}
      />

      <Box height={100} />

    </Box>
  );
}
