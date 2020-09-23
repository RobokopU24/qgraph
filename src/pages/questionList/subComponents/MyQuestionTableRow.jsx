import React, { useState } from 'react';

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

import { Link } from 'react-router-dom';

import { green, red } from '@material-ui/core/colors';

import EditQuestion from '../EditQuestion';

export default function MyQuestionTableRow({ question, save }) {
  const [showModal, toggleShowModal] = useState(false);

  function openModal(e) {
    e.preventDefault(); // We don't want to trigger the row click event
    toggleShowModal(true);
  }

  return (
    <TableRow 
      key={question.id}
      component={Link} to={`/answer/${question.metadata.firstAnswer}`}
      hover={true} style={{cursor: 'pointer'}} >

      <TableCell>
        {question.metadata.name}
      </TableCell>
      <TableCell> 
        {question.metadata.firstAnswer ? 
          <CheckIcon style={{ color: green[500] }}/> : 
          <ClearIcon style={{ color: red[500] }}/>
        }
      </TableCell>
      <TableCell> 
        {question.visibility}
      </TableCell>
      <TableCell> 
        {question.created_at}
      </TableCell>
      <TableCell> 
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          color="primary"
          onClick={ openModal }
        />
      </TableCell>

      <Dialog
        open={showModal}
        onClick={(e) => e.preventDefault() }
        onClose={() => toggleShowModal(false)}
        maxWidth="lg"
        fullWidth
        aria-labelledby="EditQuestionModal">

        <DialogTitle>
          <Box my={3} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h3">Edit Question</Typography>
            <IconButton aria-label="close" onClick={() => toggleShowModal(false)}>
              <CloseIcon fontSize="large" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <EditQuestion question={question} save={save} />
        </DialogContent>
      </Dialog>
    </TableRow>
  );
}
