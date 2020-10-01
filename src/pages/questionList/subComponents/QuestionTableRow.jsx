import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';

import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import VisibilityIcon from '@material-ui/icons/Visibility';

import { green, red } from '@material-ui/core/colors';

import EditQuestion from '@/pages/EditQuestion';

import { visibilityMapping, formatDateTimeNicely } from '@/utils/cache';

export default function MyQuestionTableRow({ question, onQuestionUpdated }) {
  const history = useHistory();

  const [showModal, toggleShowModal] = useState(false);

  function openModal(e) {
    e.stopPropagation();
    toggleShowModal(true);
  }

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
      <TableCell>
        <Button
          variant="contained"
          color="primary"
          onClick={openModal}
        >
          { question.owned ? <EditIcon /> : <VisibilityIcon /> }
        </Button>
      </TableCell>

      <Dialog
        open={showModal}
        onClick={(e) => e.stopPropagation()}
        onClose={() => toggleShowModal(false)}
        maxWidth="lg"
        fullWidth
        aria-labelledby="EditQuestionModal"
      >

        <DialogTitle>
          <Box my={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h3">
              {question.owned ? 'Edit Question' : 'Question Details'}
            </Typography>
            <IconButton aria-label="close" onClick={() => toggleShowModal(false)}>
              <CloseIcon fontSize="large" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <EditQuestion question={question} onUpdated={onQuestionUpdated} />
        </DialogContent>
      </Dialog>
    </TableRow>
  );
}
