import { createClient } from 'redis';

export class RedisDatabase {
  static async initializeDatabase() {
    const redisClient = createClient();
    redisClient.on('connect', () => {
      console.info('Redis connected!');
    });
    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
    return redisClient.connect();
  }
}
