import TransactionModel from './transaction.model.js';
import { HttpException } from '../lib/http-exception.js';
import { RedisClient } from '../lib/redis-client.js';
import { BinanceHandler } from '../lib/binance-handler.js';

export class TransactionService {
  async readTransaction() {
    const result = await TransactionModel.find({});
    return result;
  }

  // ASK를 확인
  async createTransaction(percentOfBtc, percentOfEth, totalAmount) {
    if (process.env.NODE_ENV === 'development') {
      throw new HttpException(400, 'Only available in prod mode.');
    }

    let priceOfBtc = await RedisClient.getValue('BTCUSDT_ASK');
    let priceOfEth = await RedisClient.getValue('ETHUSDT_ASK');

    if (!priceOfBtc || !priceOfEth) {
      console.log('You have to call Binace API, no cached data.');
      [priceOfBtc, priceOfEth] = await BinanceHandler.getPrices([
        'BTCUSDT',
        'ETHUSDT',
      ]);
    }

    const orderOfBtc = await this.#makeOrder(
      priceOfBtc,
      percentOfBtc,
      totalAmount,
      'BTCUSDT',
    );
    const orderOfEth = await this.#makeOrder(
      priceOfEth,
      percentOfEth,
      totalAmount,
      'ETHUSDT',
    );

    const results = [
      BinanceHandler.createOneOrder(orderOfBtc),
      BinanceHandler.createOneOrder(orderOfEth),
    ];
    const [resultOfBtc, resultOfEth] = await Promise.all(results);
    const avgPriceOfBtc = await this.#getAvgPrice(resultOfBtc.fills);
    const avgPriceOfEth = await this.#getAvgPrice(resultOfEth.fills);
    const executedAmountOfBtc = await this.#getExecutedAmount(
      resultOfBtc.fills,
    );
    const executedAmountOfEth = await this.#getExecutedAmount(
      resultOfEth.fills,
    );

    const result = await TransactionModel.create({
      transactionIdOfBtc: resultOfBtc.orderId,
      clientOrderIdOfBtc: resultOfBtc.clientOrderId,
      qtyOfBtc: resultOfBtc.executedQty,
      avgPriceOfBtc,
      transactionIdOfEth: resultOfEth.orderId,
      clientOrderIdOfEth: resultOfEth.clientOrderId,
      qtyOfEth: resultOfEth.executedQty,
      avgPriceOfEth,
      executedAmount: executedAmountOfBtc + executedAmountOfEth,
    });

    return result;
  }

  async #checkBalance(assetName, balances, totalAmount) {
    for (let balance of balances) {
      if (balance.asset == assetName) {
        if (balance.free > totalAmount) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  }

  async #makeOrder(price, percent, totalAmount, ticker) {
    let numOfDecimal = 0;
    switch (ticker) {
      case 'BTCUSDT':
        numOfDecimal = 5;
        break;
      case 'ETHUSDT':
        numOfDecimal = 4;
        break;
    }
    const order = {
      symbol: ticker,
      price: Number(price),
      quantity: Number(
        ((totalAmount * percent * 0.01) / Number(price)).toFixed(numOfDecimal),
      ),
    };
    return order;
  }

  async #getAvgPrice(fills) {
    const totalPrice = fills.reduce((acc, cur) => {
      return acc + Number(cur.price);
    }, 0);
    return totalPrice / fills.length;
  }

  async #getExecutedAmount(fills) {
    const executedAmount = fills.reduce((acc, cur) => {
      return acc + Number(cur.price) * Number(cur.qty);
    }, 0);
    return executedAmount;
  }
}
