import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';
import type { Server } from 'node:http';
import dns from 'node:dns';

function configureDns(): void {
  const servers = env.DNS_SERVERS
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (servers.length === 0) return;

  dns.setServers(servers);
  logger.info(`Using configured DNS resolvers: ${servers.join(', ')}`);
}

async function bootstrap(): Promise<void> {
  configureDns();
  await connectDB();

  let server: Server;

  function shutdown(signal: string): void {
    logger.info(`${signal} received - shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10_000);
  }

  server = app.listen(Number(env.PORT), () => {
    logger.info(`Dechub API running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${env.PORT} is already in use. Stop the existing process or choose a different PORT in .env.`);
      process.exit(1);
      return;
    }

    logger.error('HTTP server failed to start', err);
    process.exit(1);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', err);
    process.exit(1);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', reason);
    process.exit(1);
  });
}

void bootstrap().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
