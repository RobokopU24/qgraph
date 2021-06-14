import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

import { green, red } from '@material-ui/core/colors';

import API from '~/API';
import { useVisibility, formatDateTimeNicely } from '~/utils/cache';
import UserContext from '~/context/user';

export default function QuestionTableRow({ question }) {
  const history = useHistory();
  const visibility = useVisibility();
  const user = useContext(UserContext);

  /**
   * Handle row click and redirect to most recent answer
   */
  async function getAnswers() {
    let token;
    if (user) {
      token = user.id_token;
    }
    // Get all answers for selected question
    const response = await API.cache.getAnswersByQuestion(question.id, token);
    if (response.status === 'error') {
      console.log('failed to get answers');
      // pageStatus.setFailure(response.message);
      return;
    }

    if (response.length) {
      // redirect to first answer
      const answerId = response[0].id;
      history.push(`/answer/${answerId}`);
    } else {
      console.log('There are no answers for this question');
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
          { visibility.toString(question.visibility) }
        </TableCell>
      )}
      <TableCell>
        { formatDateTimeNicely(question.created_at) }
      </TableCell>
    </TableRow>
  );
}
