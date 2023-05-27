import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.redClient = createClient();
    this.redClient.on('error', (error) => {
      console.log(`Redis client not connected to server: ${error}`);
    });
  }

  isAlive() {
    if (this.redClient.connected) {
      return true;
    }
    return false;
  }

  async get(key) {
    const redGet = promisify(this.redClient.get).bind(this.redClient);
    const val = await redGet(key);
    return val;
  }

  async set(key, val, time) {
    const redSet = promisify(this.redClient.set).bind(this.redClient);
    await redSet(key, val);
    await this.redClient.expire(key, time);
  }

  async del(key) {
    const redDelete = promisify(this.redClient.del).bind(this.redClient);
    await redDelete(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
