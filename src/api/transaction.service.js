import monngose from 'mongoose';
import TransactionModel from './transaction.model.js';

export class TransactionService {
  async readTransaction() {
    const result = await TransactionModel.find({});
    return result;
  }
  async createTransaction(btcPercent, ethPercent, totalAmount) {
    // 현재 시세 조회
    // 구매 요청
    const transaction = {
      userId: 'sjb990221@gmail.com',
      contractAmount: 123456,
      numOfBtc: 12,
      unitPriceOfBtc: 500,
      numOfEth: 30,
      unitPriceOfEth: 200,
    };
    const result = await TransactionModel.create(transaction);
    return result;
  }
}
