import TransactionModel from './transaction.model.js';
import { getTickerPrices, createOneOrder } from '../lib/binance-handler.js';

export class TransactionService {
  async readTransaction() {
    const result = await TransactionModel.find({});
    return result;
  }

  async createTransaction(btcPercent, ethPercent, totalAmount) {
    const [infoOfBtc, infoOfEth] = await getTickerPrices([
      'BTCUSDT',
      'ETHUSDT',
    ]);
    const orderOfBtc = await this.#makeOrder(
      infoOfBtc,
      btcPercent,
      totalAmount,
      'BTC',
    );
    const orderOfEth = await this.#makeOrder(
      infoOfEth,
      ethPercent,
      totalAmount,
      'ETH',
    );
    const orders = [createOneOrder(orderOfBtc), createOneOrder(orderOfEth)];
    const [resultOfBtc, resultOfEth] = await Promise.all(orders);
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

  async #makeOrder(info, percent, totalAmount, ticker) {
    let numOfDecimal = 0;
    switch (ticker) {
      case 'BTC':
        numOfDecimal = 5;
        break;
      case 'ETH':
        numOfDecimal = 4;
        break;
    }
    const order = {
      symbol: info.symbol,
      price: Number(info.price),
      quantity: Number(
        ((totalAmount * percent * 0.01) / Number(info.price)).toFixed(
          numOfDecimal,
        ),
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
