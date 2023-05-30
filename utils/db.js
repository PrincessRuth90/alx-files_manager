import MongoClient from 'mongodb/lib/mongo_client';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.dbName = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(`mongodb://${host}:${port}/${this.dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this._connected = false;

    this.client
      .connect()
      .then(() => {
        this._connected = true;
      })
      .catch((err) => console.log(err));
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db(this.dbName).collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db(this.dbName).collection('files').countDocuments();
  }

  collection(name) {
    return this.client.db(this.dbName).collection(name);
  }
}

const dbClient = new DBClient();
export default dbClient;
