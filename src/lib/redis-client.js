import { createClient } from 'redis';

export class RedisClient {
  static connectRedis() {
    this.client = createClient();
    this.client.on('connect', () => {
      console.info('Redis connected');
    });
    this.client.on('error', (err) => {
      console.error(`Redis Client Error: ${err}`);
    });
    return this.client.connect();
  }

  static async getValue(key) {
    return this.client.get(key);
  }

  static async setValue(key, value) {
    return this.client.set(key, value);
  }
}
