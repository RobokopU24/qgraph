import { execSync }  from 'child_process'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import colors from 'colors';

function runCommand(cmd) {
	console.log(colors.green(cmd));
	execSync(cmd, { stdio: 'inherit' });
}

yargs(hideBin(process.argv))
  .scriptName('manage')

  .command({
    command: 'dev',
    describe: `This command starts up a development environment. The development environment is started through docker-compose and is visible at http://localhost.`,
    handler: (parsed) => {
		runCommand('docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up --build --renew-anon-volumes --abort-on-container-exit');
    },
  })

  .command({
    command: 'local-prod',
    describe: `This command starts up a development environment. The development environment is started through docker-compose and is visible at http://localhost.`,
    handler: (parsed) => {
		runCommand('docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up --build --renew-anon-volumes --abort-on-container-exit');
    },
  })

  .showHelpOnFail()
  .demandCommand()
  .strict()
  .parse()
