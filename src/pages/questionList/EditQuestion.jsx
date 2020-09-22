import React, { useState, useEffect } from 'react';

export default function EditQuestion({ question }) {
  const [newQuestion, updateNewQuestion] = useState({});
  updateNewQuestion(question);

  return (<>
    <Box my={4}>
      <Typography variant="h1">
        Robokop Question Library
      </Typography>
    </Box>

    <TextField 
        defaultValue={newQuestion.metadata.name} 
        onChange={(e) => updateNewQuestion({ metadata: {name: e} }) } />
  </>)
}
