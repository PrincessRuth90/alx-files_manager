import { MongoClient } from 'mongodb';
import Collection from 'mongodb/lib/collection';
import envLoader from './env_loader';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || 27017;
const dburl = `mongodb://${HOST}:${PORT}`;
const DATABASE = process.env.DB_DATABASE || 'files_manager';


class DBClient {
  constructor() {
    this.redisClient = new MongoClient(url);
    this.redisClient.connect().then(() => {
      this.database = this.redisClient.db(`${DATABASE}`);
    }).catch((connectionError) => {
      console.log(connectionError);
    });
  }

  isAlive() {
    return this.redisClient.isConnected();
  }

  async nbUsers() {
    const users = this.database.collection('users');
    const usersInCollection = await users.countDocuments();
    return usersInCollection;
  }

  async nbFiles() {
    const files = this.database.collection('files');
    const filesInCollection = await files.countDocuments();
    return filesInCollection;
  }
}

const databaseClient = new DBClient();
module.exports = databaseClient;
