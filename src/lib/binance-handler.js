import axios from 'axios';
import { HttpException } from './http-exception.js';
import crypto from 'crypto';

const BASE_URL = process.env.BINANCE_BASE_URL;
const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_SECRET = process.env.BINANCE_SECRET;

export class BinanceHandler {
  static async getUsdtSymbols() {
    const url = `${BASE_URL}/api/v3/ticker/price`;
    const headers = {
      'X-MBX-APIKEY': BINANCE_API_KEY,
    };
    const data = await axios
      .get(url, { headers })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        throw new HttpException(
          error.response.status,
          `code ${error.response.data.code}: ${error.response.data.msg}`,
        );
      });
    const symbols = data
      .filter((d) => d.symbol.includes('USDT'))
      .map((d) => d.symbol);
    return symbols;
  }

  static async getPrices(tickers) {
    let query = '[';
    for (let i = 0; i < tickers.length; i++) {
      query += `"${tickers[i]}"`;
      if (i < tickers.length - 1) {
        query += ',';
      } else {
        query += ']';
      }
    }
    const url = `${BASE_URL}/api/v3/ticker/price?symbols=${query}`;
    const headers = {
      'X-MBX-APIKEY': BINANCE_API_KEY,
    };
    const data = await axios
      .get(url, { headers })
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        throw new HttpException(
          error.response.status,
          `code ${error.response.data.code}: ${error.response.data.msg}`,
        );
      });
    const prices = data.map((d) => {
      return d.price;
    });
    return prices;
  }

  static async createOneOrder(order) {
    const { symbol, quantity } = order;
    const params = {
      symbol,
      side: 'BUY',
      type: 'MARKET',
      quantity,
      timestamp: Date.now(),
    };
    const queryString = this.makeQueryString(params);
    const signature = this.getSignature(queryString);
    const url =
      process.env.NODE_ENV == 'development'
        ? `${BASE_URL}/api/v3/order/test?${queryString}&signature=${signature}`
        : `${BASE_URL}/api/v3/order?${queryString}&signature=${signature}`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-MBX-APIKEY': BINANCE_API_KEY,
    };

    const data = await axios
      .post(url, null, { headers })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        throw new HttpException(
          error.response.status,
          `code ${error.response.data.code}: ${error.response.data.msg}`,
        );
      });
    return data;
  }

  static makeQueryString(params) {
    return Object.keys(params)
      .reduce((a, k) => {
        if (params[k] !== undefined) {
          a.push(k + '=' + encodeURIComponent(params[k]));
        }
        return a;
      }, [])
      .join('&');
  }

  static getSignature(queryString) {
    return crypto
      .createHmac('sha256', BINANCE_SECRET)
      .update(queryString)
      .digest('hex');
  }
}
