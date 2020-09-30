import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Route, useRouteMatch, useHistory } from "react-router-dom";

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Alert from '@material-ui/lab/Alert';
import blueGrey from '@material-ui/core/colors/red';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';

import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';

import UserContext from '@/user';
import API from '@/API';
import { formatDateTimeNicely } from '@/utils/cache';

import Loading from '@/components/loading/Loading';
import StoredAnswersetViewer from '@/components/shared/answersetView/StoredAnswersetViewer';

import EditAnswer from '@/pages/EditAnswer';

export default function QuestionAnswerViewer() {
  const [question, updateQuestion] = useState(null);
  const [answers, updateAnswers] = useState([]);

  const [showEditAnswer, toggleShowEditAnswer] = useState(false);

  const user = useContext(UserContext);

  let { question_id } = useParams();
  let { path } = useRouteMatch();
  let history = useHistory();

  let answer_id;
  // If we are rendering an answer, get answer_id with useRouteMatch
  let match = useRouteMatch(`${path}/answer/:answer_id`);
  if (match) {
    answer_id = match.params.answer_id;
  }

  async function fetchQuestion() {
    let token;
    if (user) {
      token = user.id_token;
    }
    let response  = await API.getQuestion(question_id, token);
    if (response.status == 'error') {
      console.log("Error getting question")
      return;
    }
    let question = response;
    updateQuestion(question);
  }

  useEffect(() => { fetchQuestion() }, [user, question_id]);

  async function fetchAnswers() {
    let token;
    if (user) {
      token = user.id_token;
    }
    let response  = await API.getAnswersByQuestion(question_id, token);
    if (response.status == 'error') {
      console.log("Error getting question")
      return;
    } let answers = response;
    updateAnswers(answers);

    if (!answer_id && answers.length > 0) {
      // Set default answer to first
      history.push(`/question/${question_id}/answer/${answers[0].id}`) 
    }
  }

  function getAnswer(answer_id) {
    return answers.find((a) => a.id === answer_id);
  }

  useEffect(() => { fetchAnswers() }, [user, question_id, answer_id]);

  return (
    <>
          { !question ? <Loading /> : ( <> 
            <Box my={4}>
              <Typography variant="h3">
                Question: {question.metadata.name}
              </Typography>
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
                    onChange={ (e) => 
                        history.push(`/question/${question_id}/answer/${e.target.value}`) 
                    } >
                  { answers.map((a) => 
                    <MenuItem key={a.id} value={a.id}>
                      { formatDateTimeNicely(a.created_at) }
                    </MenuItem>
                  ) }
                </Select>
              </FormControl>
            </Box>
            )}
        </> )}

    <Route path={ `${path}/answer/:answer_id` } render={(props) => (
      <>
        <Box mb={4} mt={12}>
          <Typography variant="h5">
            Answer From: { formatDateTimeNicely(getAnswer(answer_id).created_at) }
          </Typography>
        </Box>

        <Box my={4} width={1/2}>
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
                }} />
            </AccordionDetails>
          </Accordion>
        </Box>

        <StoredAnswersetViewer {...props.match.params} />
      </>
    )} />

  </>
  );
}
