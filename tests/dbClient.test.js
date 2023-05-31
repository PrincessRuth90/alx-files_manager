import { expect } from 'chai';
import dbClient from '../utils/db';
import sinon from 'sinon';

describe('dbClient', () => {
  let isAliveStub;
  let nbUsersStub;
  let nbFilesStub;

  beforeEach(() => {
    isAliveStub = sinon.stub(dbClient, 'isAlive').callsFake(() => true);
    nbUsersStub = sinon.stub(dbClient, 'nbUsers').callsFake(async () => 10);
    nbFilesStub = sinon.stub(dbClient, 'nbFiles').callsFake(async () => 20);
  });

  afterEach(() => {
    isAliveStub.restore();
    nbUsersStub.restore();
    nbFilesStub.restore();
  });

  describe('isAlive', () => {
    it('should return true', () => {
      expect(dbClient.isAlive()).to.be.true;
    });
  });

  describe('nbUsers', () => {
    it('should return 10', (done) => {
      dbClient
        .nbUsers()
        .then((count) => {
          expect(count).to.equal(10);
          done();
        })
        .catch((error) => done(error));
    });
  });
  describe('nbFiles', () => {
    it('should return 20', (done) => {
      dbClient
        .nbFiles()
        .then((count) => {
          expect(count).to.equal(20);
          done();
        })
        .catch((error) => done(error));
    });
  });
});
