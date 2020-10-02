import React from 'react';
import { useHistory } from 'react-router-dom';

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';

import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

import { green, red } from '@material-ui/core/colors';

import { visibilityMapping, formatDateTimeNicely } from '@/utils/cache';

export default function QuestionTableRow({ question }) {
  const history = useHistory();

  return (
    <TableRow
      key={question.id}
      onClick={() => history.push(`/question/${question.id}`)}
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
          { visibilityMapping[question.visibility] }
        </TableCell>
      )}
      <TableCell>
        { formatDateTimeNicely(question.created_at) }
      </TableCell>
    </TableRow>
  );
}
