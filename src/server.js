import { App } from './app.js';
import { Database } from './lib/database.js';
import { TransactionController } from './api/transaction.controller.js';
import { TransactionService } from './api/transaction.service.js';
import { SocketClient } from './lib/socket-client.js';

const SYMBOL = process.env.SYMBOL || 'BTCUSDT';

const main = async () => {
  if (process.env.NODE_ENV === 'observe') {
    const socketClient = new SocketClient(SYMBOL);
    await socketClient.initializeRedis();
    socketClient.processWebSocket();
  } else {
    await Database.initializeDatabase();
    const app = new App([new TransactionController(new TransactionService())]);
    app.listen();
  }
};

main();
