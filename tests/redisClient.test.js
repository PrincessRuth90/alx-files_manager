import { expect } from 'chai';
import redisClient from '../utils/redis';

describe('redisClient', () => {
  describe('isAlive', () => {
    it('should return true', () => {
      expect(redisClient.isAlive()).to.be.true;
    });
  });
  describe('get', () => {
    it('should return `null` for key `no_key_test`', (done) => {
      redisClient
        .get('no_key_test')
        .then((value) => {
          expect(value).to.be.null;
          done();
        })
        .catch((error) => {
          done(error);
        });
    });
    it('should return `testing` for key `test`', (done) => {
      redisClient
        .set('test', 'testing', 10)
        .then(() => {
          redisClient
            .get('test')
            .then((value) => {
              expect(value).to.equal('testing');
              done();
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => done(error));
    });
  });
  describe('set', () => {
    it('should set `testing` for key `test_set_key`', (done) => {
      redisClient
        .set('test_set_key', 'testing', 10)
        .then(() => {
          redisClient
            .get('test_set_key')
            .then((value) => {
              expect(value).to.equal('testing');
              done();
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => done(error));
    });

    it('should set `test_set_duration` that lasts for 1sec', (done) => {
      redisClient
        .set('test_set_duration', 'testing', 1)
        .then(() => {
          setTimeout(() => {
            redisClient
              .get('test_set_duration')
              .then((value) => {
                expect(value).to.been.null;
                done();
              })
              .catch((error) => {
                done(error);
              });
          }, 1500);
        })
        .catch((error) => done(error));
    });
  });
  describe('del', () => {
    it('should del a key `test_del_key`', (done) => {
      redisClient
        .set('test_del_key', 'testing', 10)
        .then(() => {
          redisClient
            .get('test_del_key')
            .then((value) => {
              expect(value).to.equal('testing');

              redisClient
                .del(`test_del_key`)
                .then(() => {
                  redisClient
                    .get('test_del_key')
                    .then((value) => {
                      expect(value).to.be.null;
                      done();
                    })
                    .catch((error) => done(error));
                })
                .catch((error) => done(error));
            })
            .catch((error) => {
              done(error);
            });
        })
        .catch((error) => done(error));
    });
  });
});
