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

  const [myQuestionsPage, myQuestionsUpdatePage] = useState(0);
  const [myQuestionsRowsPerPage, myQuestionsUpdateRowsPerPage] = useState(5);

  const [publicQuestionsPage, publicQuestionsUpdatePage] = useState(0);
  const [publicQuestionsRowsPerPage, publicQuestionsUpdateRowsPerPage] = useState(5);

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

              <Box my={3}>
                <Typography variant="h4">
                  My Questions
                </Typography>
              </Box>

              { myQuestions.length === 0 ? (
                <Box my={4}>
                  <Alert severity="info">
                    You do not have any questions that belong to you.
                    Please sign in or ask a question.
                  </Alert>
                </Box>
              ) : (
                <Paper id="questionListContainer">
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Question Name</TableCell>
                          <TableCell>Has Answers</TableCell>
                          <TableCell>Visibility</TableCell>
                          <TableCell>Created</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {myQuestions
                          .slice(myQuestionsPage * myQuestionsRowsPerPage, myQuestionsPage * myQuestionsRowsPerPage + myQuestionsRowsPerPage)
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
                    rowsPerPage={myQuestionsRowsPerPage}
                    page={myQuestionsPage}
                    onChangePage={(e, newPage) => myQuestionsUpdatePage(newPage)}
                    onChangeRowsPerPage={(e) => {
                      myQuestionsUpdateRowsPerPage(parseInt(e.target.value, 10));
                      myQuestionsUpdatePage(0);
                    }}
                  />
                </Paper>
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
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {publicQuestions
                        .slice(publicQuestionsPage * publicQuestionsRowsPerPage, publicQuestionsPage * publicQuestionsRowsPerPage + publicQuestionsRowsPerPage)
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
                  rowsPerPage={publicQuestionsRowsPerPage}
                  page={publicQuestionsPage}
                  onChangePage={(e, newPage) => publicQuestionsUpdatePage(newPage)}
                  onChangeRowsPerPage={(e) => {
                    publicQuestionsUpdateRowsPerPage(parseInt(e.target.value, 10));
                    publicQuestionsUpdatePage(0);
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
