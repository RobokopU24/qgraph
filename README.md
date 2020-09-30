# Robokop UI
**R**easoning **O**ver **B**iomedical **O**bjects linked in **K**nowledge **O**riented **P**athways
A friendly interface for users to create, upload, ask, and view biomedical questions and answers.

## Development
```bash
npm install
npm start
```
You must also run [Robokache](https://github.com/NCATS-Gamma/robokache)

Then just open http://lvh.me/

*Note: localhost will not work, due to CORS browser issues.*

## Deployment
All services are run in Docker Containers
```bash
docker-compose up
```
*See DEPLOYMENT.md for instructions pertaining to Robokache deployment.*

## Contributing

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.