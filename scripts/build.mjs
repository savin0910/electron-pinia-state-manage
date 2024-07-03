import { runCommand } from 'nuxi';

runCommand('build')
  .then(({ result }) => {
    if (result === undefined) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
