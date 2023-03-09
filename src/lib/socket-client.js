import WebSocket from 'ws';
import { createClient } from 'redis';

export class SocketClient {
  constructor(symbol) {
    this.baseUrl = process.env.BINANCE_WS_BASE_URL;
    this.symbol = symbol;
    this.path = `ws/${symbol.toLowerCase()}@depth`;
    this.initializeRedis();
  }

  initializeRedis() {
    this.redisClient = createClient();
    this.redisClient.on('connect', () => {
      console.info('[Redis Client Message] Redis connected');
    });
    this.redisClient.on('error', (err) => {
      console.error(`[Redis Client Error] ${err}`);
    });
    return this.redisClient.connect();
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

    this.webSocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      this.redisClient.set(`${this.symbol}_BID`, data['b'][0][0]);
      this.redisClient.set(`${this.symbol}_ASK`, data['a'][0][0]);
      // const bid = await this.redisClient.get(`${this.symbol}_BID`);
      // const ask = await this.redisClient.get(`${this.symbol}_ASK`);
      // console.info(`[${this.symbol} BID] ${data['b'][0][0]}`);
      // console.info(`[${this.symbol} ASK] ${data['a'][0][0]}`);
    };

    this.heartBeat();
  }
}
