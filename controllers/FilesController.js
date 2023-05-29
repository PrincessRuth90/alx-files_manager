import fs from 'fs';
import path from 'path';
import { request, response } from 'express';
import { ObjectId } from 'mongodb';
import { v4 as uuidV4 } from 'uuid';
import mime from 'mime-types';
import Queue from 'bull';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const fileQueue = new Queue('file transcoding');
async function postUpload(req = request, res = response) {
  const token = req.headers['x-token'];
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  const allowedTypes = ['folder', 'file', 'image'];

  if (!userId) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const { name } = req.body;
  const { type } = req.body;
  const { parentId } = req.body;
  const { isPublic } = req.body;
  const { data } = req.body;

  if (!name) {
    res.status(400).send({ error: 'Missing name' });
    return;
  }

  if (!allowedTypes.includes(type)) {
    res.status(400).send({ error: 'Missing type' });
    return;
  }

  if (!data && type !== 'folder') {
    res.status(400).send({ error: 'Missing data' });
    return;
  }

  if (parentId) {
    const parentFile = await dbClient
      .collection('files')
      .findOne({ _id: ObjectId(parentId) });
    if (!parentFile) {
      res.status(400).send({ error: 'Parent not found' });
      return;
    }

    if (parentFile.type !== 'folder') {
      res.status(400).send({ error: 'Parent is not a folder' });
      return;
    }
  }

  if (type === 'folder') {
    const { insertedId } = await dbClient.collection('files').insertOne({
      userId: ObjectId(userId),
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId ? ObjectId(parentId) : 0,
    });
    const file = await dbClient
      .collection('files')
      .findOne({ _id: insertedId });
    res.status(201).send({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
    return;
  }

  const targetPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  const localPath = path.join(targetPath, uuidV4());
  try {
    await fs.promises.mkdir(targetPath, { recursive: true });
  } catch (error) {
    // do nothing
  }
  try {
    await fs.promises.writeFile(localPath, data, {
      encoding: 'base64',
    });
  } catch (error) {
    res.status(400).send({ error: 'unable to create file' });
    return;
  }

  const { insertedId } = await dbClient.collection('files').insertOne({
    userId: ObjectId(userId),
    name,
    type,
    isPublic: isPublic || false,
    parentId: parentId ? ObjectId(parentId) : 0,
    localPath,
  });

  const file = await dbClient.collection('files').findOne({ _id: insertedId });

  if (file.type === 'image') {
    fileQueue.add('image-thumbnail', {
      userId,
      fileId: file._id.toString(),
    });
  }
  res.status(201).send({
    id: file._id,
    userId: file.userId,
    name: file.name,
    type: file.type,
    isPublic: file.isPublic,
    parentId: file.parentId,
  });
}

async function getShow(req = request, res = response) {
  const { id } = req.params;
  const token = req.headers['x-token'];
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);

  if (!userId) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const file = await dbClient.collection('files').findOne({
    _id: ObjectId(id),
    userId: ObjectId(userId),
  });

  if (!file) {
    res.status(404).send({ error: 'Not found' });
    return;
  }

  res.send({
    id: file._id,
    userId: file.userId,
    name: file.name,
    type: file.type,
    isPublic: file.isPublic,
    parentId: file.parentId,
  });
}

async function getIndex(req = request, res = response) {
  const token = req.headers['x-token'];
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  const { parentId } = req.query;
  const page = parseInt(req.query.page, 10) || 0;
  const pageSize = 20;
  const offset = page * pageSize;
  if (!userId) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const files = [];
  const query = {
    userId: ObjectId(userId),
  };

  if (parentId) {
    query.parentId = ObjectId(parentId);
  }
  await dbClient
    .collection('files')
    .find(query)
    .skip(offset)
    .limit(pageSize)
    .forEach((file) => {
      files.push({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    });
  res.send(files);
}

async function putPublish(req = request, res = response) {
  const { id } = req.params;
  const token = req.headers['x-token'];
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const file = await dbClient.collection('files').findOne({
    _id: ObjectId(id),
    userId: ObjectId(userId),
  });

  if (!file) {
    res.status(404).send({ error: 'Not found' });
    return;
  }

  await dbClient.collection('files').updateOne(
    {
      _id: ObjectId(id),
      userId: ObjectId(userId),
    },
    { $set: { isPublic: true } },
  );
  res.send({
    id: file._id,
    userId: file.userId,
    name: file.name,
    type: file.type,
    isPublic: true,
    parentId: file.parentId,
  });
}

async function putUnpublish(req = request, res = response) {
  const { id } = req.params;
  const token = req.headers['x-token'];
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    res.status(401).send({ error: 'Unauthorized' });
    return;
  }

  const file = await dbClient.collection('files').findOne({
    _id: ObjectId(id),
    userId: ObjectId(userId),
  });

  if (!file) {
    res.status(404).send({ error: 'Not found' });
    return;
  }

  await dbClient.collection('files').updateOne(
    {
      _id: ObjectId(id),
      userId: ObjectId(userId),
    },
    { $set: { isPublic: false } },
  );
  res.send({
    id: file._id,
    userId: file.userId,
    name: file.name,
    type: file.type,
    isPublic: false,
    parentId: file.parentId,
  });
}

async function getFile(req = request, res = response) {
  const { id } = req.params;
  const token = req.headers['x-token'];
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  const { size } = req.query;

  const file = await dbClient
    .collection('files')
    .findOne({ _id: ObjectId(id) });

  if (!file) {
    res.status(404).send({ error: 'Not found' });
    return;
  }
  const isNotOwner = !userId || file.userId !== ObjectId(userId);
  if (['folder', 'file'].includes(file.type) && !file.isPublic && isNotOwner) {
    res.status(404).send({ error: 'Not found' });
    return;
  }

  if (file.type === 'folder') {
    res.status(400).send({ error: "A folder doesn't have content" });
    return;
  }

  let { localPath } = file;

  if (size) {
    localPath = `${localPath}_${size}`;
  }

  if (!fs.existsSync(localPath)) {
    res.status(404).send({ error: 'Not found' });
    return;
  }
  const mimeType = mime.lookup(file.name);

  res.header('Content-Type', mimeType);
  const base64 = await fs.promises.readFile(localPath);
  if (file.type === 'file') {
    res.send(Buffer.from(base64.toString(), 'base64').toString());
    return;
  }

  res.sendFile(localPath);
}

const FileController = {
  postUpload,
  getShow,
  getIndex,
  putPublish,
  putUnpublish,
  getFile,
};

export default FileController;
