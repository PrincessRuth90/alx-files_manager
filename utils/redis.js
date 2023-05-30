import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (err) => {
      console.log(err);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  get(key) {
    const get = promisify(this.client.get).bind(this.client);
    return get(key);
  }

  set(key, value, duration) {
    const set = promisify(this.client.setex).bind(this.client);
    return set(key, duration, value);
  }

  del(key) {
    const del = promisify(this.client.del).bind(this.client);
    return del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
