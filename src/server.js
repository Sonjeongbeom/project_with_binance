import { App } from './app.js';
import { Database } from './lib/database.js';
import { TransactionController } from './api/transaction.controller.js';
import { TransactionService } from './api/transaction.service.js';
import { SocketClient } from './lib/socket-client.js';
import { RedisClient } from './lib/redis-client.js';

const SYMBOL = process.env.SYMBOL || 'BTCUSDT';

const main = async () => {
  if (process.env.NODE_ENV === 'ws') {
    await RedisClient.connectRedis();
    const socketClient = new SocketClient();
    await socketClient.initializePath();
    socketClient.processWebSocket();
  } else {
    await Database.initializeDatabase();
    await RedisClient.connectRedis();
    const app = new App([new TransactionController(new TransactionService())]);
    app.listen();
  }
};

main();
