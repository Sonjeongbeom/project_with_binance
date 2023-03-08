import axios from 'axios';
import { HttpException } from './http-exception.js';
import crypto from 'crypto';

const BASE_URL = process.env.BINANCE_BASE_URL;
const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
const BINANCE_SECRET = process.env.BINANCE_SECRET;

const makeQueryString = (q) =>
  Object.keys(q)
    .reduce((a, k) => {
      if (q[k] !== undefined) {
        a.push(k + '=' + encodeURIComponent(q[k]));
      }
      return a;
    }, [])
    .join('&');

export async function getSignature(queryString) {
  return crypto
    .createHmac('sha256', BINANCE_SECRET)
    .update(queryString)
    .digest('hex');
}

export async function getTickerPrices(tickers) {
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
  return axios
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
}

export async function createOneOrder(order) {
  const { symbol, price, quantity } = order;
  const params = {
    symbol,
    side: 'BUY',
    type: 'MARKET',
    quantity,
    timestamp: Date.now(),
  };
  const query = makeQueryString(params);
  const signature = await getSignature(query);
  const url =
    process.env.NODE_ENV == 'development'
      ? `${BASE_URL}/api/v3/order/test?${query}&signature=${signature}`
      : `${BASE_URL}/api/v3/order?${query}&signature=${signature}`;
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-MBX-APIKEY': BINANCE_API_KEY,
  };

  return axios
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
}
