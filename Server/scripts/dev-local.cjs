const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { MongoMemoryServer } = require('mongodb-memory-server-core');

async function main() {
  const dataPath = path.resolve(__dirname, '..', '.local-mongodb');
  await fs.mkdir(dataPath, { recursive: true });

  const mongo = await MongoMemoryServer.create({
    binary: { version: '7.0.14' },
    instance: {
      dbPath: dataPath,
      ip: '127.0.0.1',
      port: 27017,
      storageEngine: 'wiredTiger',
    },
  });

  const runnerPath = path.resolve(
    __dirname,
    '..',
    'node_modules',
    'ts-node-dev',
    'lib',
    'bin.js',
  );
  const server = spawn(
    process.execPath,
    [runnerPath, '--respawn', '--transpile-only', 'src/server.ts'],
    {
      cwd: path.resolve(__dirname, '..'),
      env: {
        ...process.env,
        MONGODB_URI: mongo.getUri('dechub'),
      },
      stdio: 'inherit',
    },
  );

  let shuttingDown = false;
  const stop = async (signal, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;

    if (server.exitCode === null && !server.killed) {
      server.kill(signal);
    }

    await mongo.stop();
    process.exit(exitCode);
  };

  server.on('error', (error) => {
    console.error('Failed to start the local API server:', error);
    void stop('SIGTERM', 1);
  });
  server.on('exit', (code, signal) => {
    void stop(signal || 'SIGTERM', code ?? 1);
  });

  process.on('SIGINT', () => void stop('SIGINT'));
  process.on('SIGTERM', () => void stop('SIGTERM'));

  console.log(`Local MongoDB started at ${mongo.getUri('dechub')}`);
}

main().catch((error) => {
  console.error('Failed to start the local development environment:', error);
  process.exitCode = 1;
});
