docker run --name frontend frontend npm run test -- "$@"
docker cp frontend:/app/jest.results.json .
