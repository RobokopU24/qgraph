import React, { useState, useContext, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import Alert from '@material-ui/lab/Alert';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

import Loading from '@/components/loading/Loading';

import API from '@/API';

import './questionList.css';

import UserContext from '@/user';

import QuestionTableRow from './subComponents/QuestionTableRow';

export default function QuestionList() {
  const [myQuestions, updateMyQuestions] = useState([]);
  const [publicQuestions, updatePublicQuestions] = useState([]);
  const [loading, toggleLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [page, updatePage] = useState(0);
  const [rowsPerPage, updateRowsPerPage] = useState(5);

  const user = useContext(UserContext);

  async function fetchQuestions() {
    const response = await API.cache.getQuestions(user && user.id_token);
    if (response.status === 'error') {
      setErrorMessage(response.message);
      toggleLoading(false);
      return;
    }
    const questions = response;

    updateMyQuestions(questions.filter((question) => question.owned));
    updatePublicQuestions(questions.filter((question) => !question.owned));

    toggleLoading(false);
  }

  useEffect(() => { fetchQuestions(); }, [user]);

  return (
    <>

      <Box my={4}>
        <Typography variant="h3">
          Robokop Question Library
        </Typography>
      </Box>

      { loading ? <Loading /> : (
        <>
          { errorMessage ? (
            <Box display="flex" justifyContent="center">
              <Alert variant="filled" severity="error">
                {errorMessage}
              </Alert>
            </Box>
          ) : (
            <>

              {/* Only show "My Questions" if the user is signed in */}

              { !myQuestions.length ? '' : (
                <>
                  <Box my={3}>
                    <Typography variant="h4">
                      My Questions
                    </Typography>
                  </Box>

                  <Paper id="questionListContainer">
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Question Name</TableCell>
                            <TableCell>Has Answers</TableCell>
                            <TableCell>Visibility</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Edit</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {myQuestions
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((question) => (
                              <QuestionTableRow
                                key={question.id}
                                question={question}
                                onQuestionUpdated={fetchQuestions}
                              />
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={myQuestions.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onChangePage={(e, newPage) => updatePage(newPage)}
                      onChangeRowsPerPage={(e) => {
                        updateRowsPerPage(parseInt(e.target.value, 10));
                        updatePage(0);
                      }}
                    />
                  </Paper>
                </>
              )}

              {/* Always show public questions */}
              <Box my={3}>
                <Typography variant="h4">
                  Public Questions
                </Typography>
              </Box>

              <Paper id="questionListContainer">
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Question Name</TableCell>
                        <TableCell>Has Answers</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>View Details</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {publicQuestions
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((question) => (
                          <QuestionTableRow
                            key={question.id}
                            question={question}
                            onQuestionUpdated={fetchQuestions}
                          />
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={publicQuestions.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={(e, newPage) => updatePage(newPage)}
                  onChangeRowsPerPage={(e) => {
                    updateRowsPerPage(parseInt(e.target.value, 10));
                    updatePage(0);
                  }}
                />
              </Paper>

            </>
          )}
        </>
      )}
    </>
  );
}
