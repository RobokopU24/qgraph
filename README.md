# Robokop UI
**R**easoning **O**ver **B**iomedical **O**bjects linked in **K**nowledge **O**riented **P**athways

A friendly interface for users to create, upload, ask, and view biomedical questions and answers.

## Development

### Setup

1. Clone this repository locally.
1. Install the following dependencies.
    * [Docker](https://docs.docker.com/get-docker/)
    * [Docker Compose](https://docs.docker.com/compose/install/)
    * Optional to use management script:
		* Install [Node.js](https://nodejs.org/)
		* Run `npm install`

### Run

The recommended way to run a local development environment is using the `manage.js` script: 
```bash
node manage.js dev
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

You may also use the management script (not recommended for actual deployment but may be useful for local testing of the production environment):

```bash
node manage.js local-prod
```

## Contributing

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
