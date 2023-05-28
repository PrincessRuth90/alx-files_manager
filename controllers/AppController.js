import databaseClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
    static getStatus(req, resp) {
      resp.status(200).json({ redis: redisClient.isAlive(), db: databaseClient.isAlive() });
    }
  
    static async getStats(req, resp) {
        const filesStats = await databaseClient.nbFiles();
      const usersStats = await databaseClient.nbUsers();
      resp.status(200).json({ users: usersStats, files: filesStats });
    }
  }
  
  module.exports = AppController;
