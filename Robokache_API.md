# How to interact with Robokache through its API

1. You need to have an email/password account through the qgraph UI. Please visit https://robokop.renci.org:7080 and create an account.

2. The following cURL will validate your user and provide you an access token that you can use with Robokache. The `client_id` is specific to Auth0 and you shouldn't have to do anything with it.
```bash
curl --request POST \
  --url 'https://qgraph.us.auth0.com/oauth/token' \
  --header 'content-type: application/x-www-form-urlencoded' \
  --data-urlencode grant_type=password \
  --data-urlencode username={email} \
  --data-urlencode password={password} \
  --data-urlencode 'client_id=sgJrK1gGAbzrXwUp0WG7jAV0ivCIF6jr'
```

3. You then need to create an answer document on Robokache with metadata which will return you an answer_id
```bash
curl --request POST \
  --url 'https://robokop.renci.org:7080/api/robokache/document' \
  --header 'Authorization: Bearer {access_token}' \
  --data '{"parent":"","visibility":2,"metadata":{"name":"Uploaded Answer","answerOnly":true,"hasAnswers":true}}'
```

4. Once an answer has been created, you can upload your message using the answer_id
```bash
curl --request PUT \
  --url 'https://robokop.renci.org:7080/api/robokache/document/{answer_id}/data' \
  --header 'Authorization: Bearer {access_token}' \
  --data '{message}'
```

5. To view this message in the UI, go to https://robokop.renci.org:7080/answer/{answer_id}
