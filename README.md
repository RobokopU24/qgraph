# Robokop UI
**R**easoning **O**ver **B**iomedical **O**bjects linked in **K**nowledge **O**riented **P**athways

A friendly interface for users to create, upload, ask, and view biomedical questions and answers.

## Development

### Setup

1. Clone this repository locally.
2. Install the following dependencies.
    * [Docker](https://docs.docker.com/get-docker/)
    * [Docker Compose](https://docs.docker.com/compose/install/)
		* Install [Node.js](https://nodejs.org/)
		* Run `npm install`
3. (Optional) Add an `.env` file to the root directory to override any service urls.

Sample `.env` file:
```bash
PORT=7080

# Internal message storage
ROBOKACHE=http://localhost:8080/api

# External ARAs
STRIDER=https://strider.renci.org/1.2
ARAGORN=https://aragorn.renci.org/1.2
ROBOKOP=https://robokop-ara.apps.renci.org

# External Services
NODE_NORMALIZER=https://nodenormalization-sri.renci.org
NAME_RESOLVER=https://name-resolution-sri.renci.org
BIOLINK=https://raw.githubusercontent.com/biolink/biolink-model/2.2.5/biolink-model.yaml
```

### Run Locally
```bash
npm run dev
```

You may also directly invoke docker-compose with the following command:

```bash
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up --build
```

## Deployment

Deploy using the following command (recommended):
```bash
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up --build --renew-anon-volumes --abort-on-container-exit
```

## Contributing

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
