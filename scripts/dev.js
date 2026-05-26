const { spawn } = require('node:child_process');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const children = [];

const startProcess = (name, script) => {
  const child = spawn(npmCommand, ['run', script], {
    stdio: 'inherit',
    env: process.env
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      process.exitCode = code || 1;
      shutdown();
    }
  });

  children.push(child);
};

const shutdown = () => {
  while (children.length) {
    const child = children.pop();
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startProcess('server', 'start:server');
startProcess('client', 'start:client');
