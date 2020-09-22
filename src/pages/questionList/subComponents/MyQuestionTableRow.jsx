import React, { useState } from 'react';

import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';

import { Link } from 'react-router-dom';

import { green, red } from '@material-ui/core/colors';


export default function MyQuestionTableRow({ question }) {
  const [showModal, toggleShowModal] = useState(false);

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
          onClick={toggleShowModal()}
        />
      </TableCell>

      <Dialog
        open={showModal}
        onClose={() => toggleModal(false)}
        maxWidth="lg"
        fullWidth
        aria-labelledby="EditQuestionModal">

        <DialogTitle disableTypography>
          <Typography variant="h3">Edit Question</Typography>
          <IconButton aria-label="close" onClick={() => toggleModal(false)}>
            <CloseIcon fontSize="large" />
          </IconButton>
        </DialogTitle>
        Hi
      </Dialog>
    </TableRow>
  );
}
