import { App } from './app.js';
import { Database } from './lib/database.js';
import { TransactionController } from './api/transaction.controller.js';
import { TransactionService } from './api/transaction.service.js';

const main = async () => {
  await Database.initializeDatabase();
  const app = new App([new TransactionController(new TransactionService())]);
  app.listen();
};

main();
