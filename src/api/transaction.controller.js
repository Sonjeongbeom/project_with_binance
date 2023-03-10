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
    const { percentOfBtc = 50, percentOfEth = 50, totalAmount } = req.body;
    if (!totalAmount || percentOfBtc + percentOfEth !== 100) {
      throw new HttpException(400, 'Inproper input');
    }

    if (
      totalAmount < 30 ||
      totalAmount * percentOfBtc * 0.01 < 10 ||
      totalAmount * percentOfEth * 0.01 < 10
    ) {
      throw new HttpException(
        400,
        'Amount is not enough. ($10 each, $30 total)',
      );
    }

    const data = await this.transactionService.createTransaction(
      percentOfBtc,
      percentOfEth,
      totalAmount,
    );
    return { data };
  }
}
