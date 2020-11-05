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

  try {
  // Execute command with io attached to stdio
    execSync(cmdStripped, { stdio: 'inherit' });
  } catch (e) { /* continue regardless of error */ }
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
    command: 'frontend <command>',
    describe: 'Run an npm script defined in the frontend service',
    handler: (argv) => {
      // Build container
      runCommand(`
        (cd frontend/ && docker build -t frontend -f Dockerfile.dev .)
      `);
      // Run command
      runCommand(`
         docker run frontend npm run ${argv.command}
        `);
    },
  })

  .showHelpOnFail()
  .demandCommand()
  .strict()
  .parse();
