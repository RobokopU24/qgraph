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

import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';

import UserContext from '@/user';
import API from '@/API';
import { formatDateTimeNicely } from '@/utils/cache';

import Loading from '@/components/loading/Loading';
import StoredAnswersetViewer from '@/components/shared/answersetView/StoredAnswersetViewer';

export default function QuestionAnswerViewer() {
  const [question, updateQuestion] = useState(null);
  const [answers, updateAnswers] = useState([]);

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

    if (!answer_id) {
      // Set default answer to first
      history.push(`/question/${question_id}/answer/${answers[0].id}`) 
    }
  }

  useEffect(() => { fetchAnswers() }, [user, question_id]);

  return (
    <>
          { !question ? <Loading /> : ( <> 
            <Box my={4} display="flex" justifyContent="space-between">
              <Typography variant="h3">
                Question: {question.metadata.name}
              </Typography>
              <Button
                  variant="contained"
                  color="primary">
                { question.owned ? <EditIcon /> : <VisibilityIcon /> }
              </Button>
            </Box>
            
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
        </> )}

    <Route path={ `${path}/answer/:answer_id` } render={(props) => (
      <StoredAnswersetViewer {...props.match.params} />
    )} />

  </>
  );
}
