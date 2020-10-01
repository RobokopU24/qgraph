import React, { useState, useContext, useEffect } from 'react';
import {
  Route, useRouteMatch, useHistory, useParams,
} from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Alert from '@material-ui/lab/Alert';
import Divider from '@material-ui/core/Divider';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

import UserContext from '@/user';
import API from '@/API';
import { formatDateTimeNicely } from '@/utils/cache';

import Loading from '@/components/loading/Loading';
import StoredAnswersetViewer from '@/components/shared/answersetView/StoredAnswersetViewer';

import EditQuestion from '@/pages/EditQuestion';
import EditAnswer from '@/pages/EditAnswer';

export default function QuestionAnswerViewer() {
  const [question, updateQuestion] = useState(null);
  const [answers, updateAnswers] = useState([]);

  const user = useContext(UserContext);

  const { question_id } = useParams();
  const { path } = useRouteMatch();
  const history = useHistory();

  let answer_id;
  // If we are rendering an answer, get answer_id with useRouteMatch
  const match = useRouteMatch(`${path}/answer/:answer_id`);
  if (match) {
    answer_id = match.params.answer_id;
  }

  async function fetchQuestion() {
    let token;
    if (user) {
      token = user.id_token;
    }
    const response = await API.getQuestion(question_id, token);
    if (response.status === 'error') {
      return;
    }
    updateQuestion(response);
  }

  useEffect(() => { fetchQuestion(); }, [user, question_id]);

  async function fetchAnswers() {
    let token;
    if (user) {
      token = user.id_token;
    }
    const response = await API.getAnswersByQuestion(question_id, token);
    if (response.status === 'error') {
      return;
    }
    const newAnswers = response;
    updateAnswers(newAnswers);

    if (!answer_id && newAnswers.length > 0) {
      // Set default answer to first
      history.replace(`/question/${question_id}/answer/${newAnswers[0].id}`);
    }
  }

  function getAnswer(id) {
    return answers.find((a) => a.id === id);
  }

  function handleQuestionDeleted() {
    history.push('/questions');
  }

  useEffect(() => { fetchAnswers(); }, [user, question_id, answer_id]);

  return (
    <>
      { !question ? <Loading /> :
        (
          <>
            <Box my={4}>
              <Typography variant="h3">
                Question: {question.metadata.name}
              </Typography>
            </Box>

            <Box my={4} mx="auto" width={2 / 3}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="question-details-content"
                  id="question-details-header"
                >
                  <Typography>Details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <EditQuestion
                    question={question}
                    onUpdated={fetchQuestion}
                    onDeleted={handleQuestionDeleted}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>

            { answers.length === 0 ? (
              <Alert severity="error">
                There are no answers associated with this question. Please try re-submitting.
              </Alert>
            ) : (
              <Box>
                <FormControl>
                  <InputLabel htmlFor="answer-select">Viewing Answer From</InputLabel>
                  <Select
                    id="answer-select"
                    value={answer_id || ''}
                    onChange={(e) => history.push(`/question/${question_id}/answer/${e.target.value}`)}
                  >
                    { answers.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        { formatDateTimeNicely(a.created_at) }
                      </MenuItem>
                    )) }
                  </Select>
                </FormControl>
              </Box>
            )}
          </>
        )}

      <Box my={8}>
        <Divider />
      </Box>

      <Route
        path={`${path}/answer/:answer_id`}
        render={(props) => (
          getAnswer(answer_id) && (
            <>
              <Box mb={4}>
                <Typography variant="h4">
                  Answer Explorer
                </Typography>
              </Box>

              <Box my={4} mx="auto" width={2 / 3}>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="answer-details-content"
                    id="answer-details-header"
                  >
                    <Typography>Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <EditAnswer
                      answer={getAnswer(answer_id)}
                      afterDelete={() => {
                        history.push(`/question/${question_id}`);
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>

              <StoredAnswersetViewer {...props.match.params} />
            </>
          )
        )}
      />

    </>
  );
}
