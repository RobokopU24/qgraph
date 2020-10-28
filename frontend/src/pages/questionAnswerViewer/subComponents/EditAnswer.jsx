import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import LinkIcon from '@material-ui/icons/Link';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';

import API from '@/API';
import UserContext from '@/context/user';
import ClipboardButton from '@/components/shared/ClipboardButton';
import NewDownloadButton from '@/components/shared/NewDownloadButton';

export default function EditAnswer({ answer, afterDelete }) {
  const [newAnswer, updateNewAnswer] = useState(answer);
  const user = useContext(UserContext);

  const router_location = useLocation();
  const fullLocation = window.location.origin + router_location.pathname;

  async function save(ans) {
    const response = await API.cache.updateAnswer(ans, user.id_token);
    if (response.status === 'error') {
      return;
    }
    updateNewAnswer(ans);
  }

  async function handleDelete() {
    const response = await API.cache.deleteAnswer(answer.id, user.id_token);
    afterDelete(response);
  }

  useEffect(() => {
    updateNewAnswer(answer);
  }, [answer]);

  return (
    <Box mx={1}>

      <Box my={4}>
        <FormControl>
          <InputLabel htmlFor="visibility-select">Visibility</InputLabel>
          <Select
            id="visibility-select"
            value={newAnswer.visibility}
            disabled={!answer.owned}
            onChange={(e) => save({ ...newAnswer, visibility: e.target.value })}
          >
            <MenuItem value={1}>Private</MenuItem>
            <MenuItem value={2}>Shareable</MenuItem>
            <MenuItem value={3}>Public</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box mt={6} mb={4}>
        <Typography variant="h4">
          Actions
        </Typography>
      </Box>

      <ClipboardButton
        startIcon={<LinkIcon />}
        displayText="Get Shareable Link"
        notificationText="Shareable link copied to clipboard"
        clipboardText={fullLocation}
      />

      {answer.owned && (
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
        <NewDownloadButton
          displayText="Download JSON"
          getData={() => API.cache.getAnswerData(answer.id, user.id_token)}
          fileName={() => 'answer_data.json'}
        />
      </Box>

    </Box>
  );
}
