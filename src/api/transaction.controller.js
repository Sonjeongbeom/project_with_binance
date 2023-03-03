import { Router } from 'express';
import { TransactionService } from './transaction.service.js';

export class TransactionController {
  /**
   * @param { TransactionService } transactionService
   */
  constructor(transactionService) {
    this.router = Router();
    this.transactionService = transactionService;
    this.path = '/order';
    this.#initializeRoutes();
  }

  #initializeRoutes() {
    this.router.get('/', this.readTransaction.bind(this));
    this.router.post('/', this.createTransaction.bind(this));
  }

  async sayHello(req, _res) {
    return _res.send('say Hello!');
  }

  async readTransaction(req, res) {
    const data = await this.transactionService.readTransaction();
    return res.status(200).json({
      success: true,
      message: 'read success',
      data,
    });
  }

  async createTransaction(req, res) {
    const { btcPercent, ethPercent, totalAmount } = req.body;
    const data = await this.transactionService.createTransaction(
      btcPercent,
      ethPercent,
      totalAmount,
    );
    return res.status(201).json({
      success: true,
      message: 'create success',
      data,
    });
  }
}
