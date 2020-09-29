import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '@/user';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Loading from '@/components/loading/Loading';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import EditIcon from '@material-ui/icons/Edit';
import VisibilityIcon from '@material-ui/icons/Visibility';

import Select from '@material-ui/core/Select';

import API from '@/API';
import { formatDateTimeNicely } from '@/utils/cache';

export default function QuestionAnswerViewer() {
  const [question, updateQuestion] = useState(null);
  const [answers, updateAnswers] = useState([]);
  const [selectedAnswer, updateSelectedAnswer] = useState({});

  const user = useContext(UserContext);

  let { question_id } = useParams();

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
    }
    let answers = response;
    updateAnswers(answers);

    // Set default answer to first
    updateSelectedAnswer(answers[0]);
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
                value={selectedAnswer} 
                onChange={ (e) => updateSelectedAnswer(e) } >
              { answers.map((a) => 
                <MenuItem key={a.id} value={a}>{ formatDateTimeNicely(a.created_at) }</MenuItem>
              ) }
            </Select>
          </FormControl>
        </Box>
    </> )}
  </>
  );
}
