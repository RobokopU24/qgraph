import { execSync }  from 'child_process'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import colors from 'colors';

function runCommand(cmd) {
	// Strip newlines so we can use multiline templates
	cmd = cmd.replace(/(\r\n|\n|\r)/gm, "");
	console.log(colors.green(cmd));
	execSync(cmd, { stdio: 'inherit' });
}

let baseCommand = 'docker-compose -f docker-compose.base.yml ';

yargs(hideBin(process.argv))
  .scriptName('manage')

  .command({
    command: 'dev',
    describe: `This command starts up a development environment. The development environment is started through docker-compose and is visible at http://localhost.`,
	builder: {
	  hotReload: {
		  type: 'boolean',
		  default: false,
	  }
	},
    handler: (argv) => {
		let envs = "";
		if(argv.hotReload) {
			envs = "FRONTEND_COMMAND='npm run hot-reload'"
		}
		runCommand(`${envs} ${baseCommand} -f docker-compose.dev.yml 
			up --build --renew-anon-volumes
			--abort-on-container-exit`);
    },
  })

  .command({
    command: 'local-prod',
    describe: `This command starts up a development environment. The development environment is started through docker-compose and is visible at http://localhost.`,
    handler: (argv) => {
		runCommand(`${baseCommand} -f docker-compose.prod.yml
			up --build --renew-anon-volumes --abort-on-container-exit`);
    },
  })

  .showHelpOnFail()
  .demandCommand()
  .strict()
  .parse()
