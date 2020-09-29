import React, { useState, useContext, useEffect } from 'react';
import UserContext from '@/user';

export default function QuestionAnswerViewer() {
  const [question, updateQuestion] = useState({});
  const [answers, updateAnswers] = useState([]);
  const [selectedAnswer, updateSelectedAnswer] = useState({});

  const user = useContext(UserContext);

  let { question_id, answer_id } = useParams();

  async function fetchQuestion() {
    let response  = await API.getQuestion(question_id, user.id_token);
    if (response.status == 'error') {
      console.log("Error getting question")
      return;
    }
    let question = response;
    updateQuestion(question);
  }

  useEffect(() => { fetchQuestion() }, [user]);

  async function fetchAnswers() {
    let response  = await API.getAnswersByQuestion(question_id, user.id_token);
    if (response.status == 'error') {
      console.log("Error getting question")
      return;
    }
    let answers = response;
    updateAnswers(answers);
  }



  return (
    <>
    </>
  );
}
