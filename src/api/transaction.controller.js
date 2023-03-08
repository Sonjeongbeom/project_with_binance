import { Router } from 'express';
import { TransactionService } from './transaction.service.js';
import { HttpException } from '../lib/http-exception.js';
import { wrapper } from '../lib/response-handler.js';

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
    this.router.get('/', wrapper(this.readTransaction.bind(this)));
    this.router.post('/', wrapper(this.createTransaction.bind(this)));
  }

  async readTransaction(req, res) {
    const data = await this.transactionService.readTransaction();
    return { data };
  }

  async createTransaction(req, res) {
    const { btcPercent = 50, ethPercent = 50, totalAmount } = req.body;
    if (!totalAmount) {
      throw new HttpException(400, 'You have to write all inputs.');
    }
    if (totalAmount < 50) {
      throw new HttpException(400, 'Amount is not enough. (minimum $50)');
    }

    const data = await this.transactionService.createTransaction(
      btcPercent,
      ethPercent,
      totalAmount,
    );
    return { data };
  }
}
