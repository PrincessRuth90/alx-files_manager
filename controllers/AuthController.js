import { request, response } from 'express';
import { v4 as uuidV4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

async function getConnect(req = request, res = response) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  const base64 = authorization.split(' ')[1];
  const credentials = Buffer.from(base64, 'base64').toString();
  const [email, password] = credentials.split(':');
  const user = await dbClient.collection('users').findOne({ email });

  if (!user || user.password !== sha1(password)) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  const token = uuidV4();
  const key = `auth_${token}`;
  await redisClient.set(key, user._id, 60 * 60 * 24);
  res.send({ token });
}

async function getDisconnect(req, res) {
  const token = req.headers['x-token'];

  const key = `auth_${token}`;
  const user = await redisClient.get(key);
  if (!user) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }
  await redisClient.del(key);
  res.status(204).send();
}

const AuthController = {
  getConnect,
  getDisconnect,
};

export default AuthController;
