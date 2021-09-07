import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

import { green, red } from '@material-ui/core/colors';

import API from '~/API';
import { useVisibility, formatDateTimeNicely } from '~/utils/cache';
import AlertContext from '~/context/alert';

export default function QuestionTableRow({ question, onQuestionUpdated }) {
  const history = useHistory();
  const visibility = useVisibility();
  const displayAlert = useContext(AlertContext);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  /**
   * Update question visibility on Robokache
   * @param {boolean} checked - is the 'public' switch on
   */
  async function setVisibility(checked) {
    let accessToken;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert('error', `Failed to get user questions. Error: ${err}`);
      }
    }
    question.visibility = checked ? visibility.toInt('Public') : visibility.toInt('Shareable');
    const response = await API.cache.updateQuestion(question, accessToken);
    if (response.status === 'error') {
      displayAlert('error', 'Failed to set question visibility.');
      return;
    }
    onQuestionUpdated();
  }

  /**
   * Handle row click and redirect to most recent answer
   */
  async function getAnswers() {
    let accessToken;
    if (isAuthenticated) {
      try {
        accessToken = await getAccessTokenSilently();
      } catch (err) {
        displayAlert('error', `Failed to get user questions. Error: ${err}`);
      }
    }
    if (question.metadata.answerOnly) {
      // This is an answer with no parent, send to
      // answer page
      history.push(`/answer/${question.id}`);
    } else {
      // Get all answers for selected parent question
      const response = await API.cache.getAnswersByQuestion(question.id, accessToken);
      if (response.status === 'error') {
        displayAlert('error', 'Failed to load answers.');
        return;
      }

      if (response.length) {
        // redirect to first answer
        const answerId = response[0].id;
        history.push(`/answer/${answerId}`);
      } else {
        displayAlert('warning', 'There are no answers for this question.');
      }
    }
  }

  return (
    <TableRow
      key={question.id}
      onClick={getAnswers}
      hover
      style={{ cursor: 'pointer' }}
    >
      <TableCell>
        {question.metadata.name}
      </TableCell>
      <TableCell>
        {question.metadata.hasAnswers ?
          <CheckIcon style={{ color: green[500] }} /> :
          <ClearIcon style={{ color: red[500] }} />}
      </TableCell>
      { question.owned && (
        <TableCell>
          <FormControlLabel
            label="Public"
            onClick={(e) => {
              // stop from going to answer page
              e.stopPropagation();
              setVisibility(e.target.checked);
            }}
            control={(
              <Switch
                checked={question.visibility >= visibility.toInt('Public')}
                color="primary"
              />
            )}
          />
        </TableCell>
      )}
      <TableCell>
        { formatDateTimeNicely(question.created_at) }
      </TableCell>
    </TableRow>
  );
}
