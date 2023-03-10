import WebSocket from 'ws';
import { RedisClient } from './redis-client.js';
import { BinanceHandler } from './binance-handler.js';

export class SocketClient {
  constructor() {
    this.baseUrl = process.env.BINANCE_WS_BASE_URL;
  }

  async initializePath() {
    const symbols = await BinanceHandler.getUsdtSymbols();
    const path = symbols.reduce((acc, symbol) => {
      return acc + `/${symbol.toLowerCase()}@depth`;
    }, '');
    this.path = `ws${path}`;
  }

  saveCurrentPrice(symbol, position, orderBook) {
    if (orderBook.length > 0) {
      RedisClient.setValue(`${symbol}_${position}`, orderBook[0][0]);
    }
  }

  heartBeat() {
    setInterval(() => {
      if (this.webSocket.readyState === WebSocket.OPEN) {
        this.webSocket.ping();
        console.debug('ping server');
      }
    }, 5000);
  }

  processWebSocket() {
    console.log(`BASE URL : ${this.baseUrl}/${this.path}`);
    this.webSocket = new WebSocket(`${this.baseUrl}/${this.path}`);

    this.webSocket.onopen = () => {
      console.info('WebSocket connected');
    };

    this.webSocket.on('pong', () => {
      console.debug('receieved pong from server');
    });

    this.webSocket.on('ping', () => {
      console.debug('receieved ping from server');
      this.webSocket.pong();
    });

    this.webSocket.onclose = () => {
      console.warn('WebSocket closed');
    };

    this.webSocket.onerror = (err) => {
      console.warn('WebSocket error', err);
    };

    this.webSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.saveCurrentPrice(data.s, 'BID', data.b);
      this.saveCurrentPrice(data.s, 'ASK', data.a);
    };

    this.heartBeat();
  }
}
