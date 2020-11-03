import { execSync } from 'child_process';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import colors from 'colors';

function runCommand(cmd) {
  // Strip newlines so we can use multiline templates
  const cmdStripped = cmd.replace(/(\r\n|\n|\r)/gm, '');

  // Print out what we are running for user's benefit
  // eslint-disable-next-line no-console
  console.log(colors.green(cmdStripped));

  // Execute command with io attached to stdio
  execSync(cmdStripped, { stdio: 'inherit' });
}

const baseCommand = 'docker-compose -f docker-compose.base.yml ';

yargs(hideBin(process.argv))
  .scriptName('manage')

  .command({
    command: 'dev',
    describe: 'This command starts up a development environment. The development environment is started through docker-compose and is visible at http://localhost.',
    builder: {
      hotReload: {
        type: 'boolean',
        default: false,
      },
    },
    handler: (argv) => {
      let envs = '';
      if (argv.hotReload) {
        envs = "FRONTEND_COMMAND='npm run hot-reload'";
      }
      runCommand(`
            ${envs} ${baseCommand} -f docker-compose.dev.yml 
            up --build --renew-anon-volumes
            --abort-on-container-exit
      `);
    },
  })

  .command({
    command: 'local-prod',
    describe: 'This command starts up a development environment. The development environment is started through docker-compose and is visible at http://localhost.',
    handler: () => {
      runCommand(`
         ${baseCommand} -f docker-compose.prod.yml
         up --build --renew-anon-volumes --abort-on-container-exit
      `);
    },
  })

  .command({
    command: 'test',
    describe: 'Runs tests through docker-compose and exits',
    handler: () => {
      runCommand(`
        ${baseCommand} -f docker-compose.test.yml
        up --build --renew-anon-volumes --abort-on-container-exit
      `);
    },
  })

  .showHelpOnFail()
  .demandCommand()
  .strict()
  .parse();
