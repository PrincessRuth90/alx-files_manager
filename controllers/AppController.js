import redisClient from '../utils/redis';
import dbClient from '../utils/db';

function getStatus(req, res) {
  res.send({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
}

async function getStats(req, res) {
  res.send({
    users: await dbClient.nbUsers(),
    files: await dbClient.nbFiles(),
  });
}

const AppController = {
  getStatus,
  getStats,
};

export default AppController;
