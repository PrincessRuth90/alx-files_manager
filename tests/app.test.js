import request from 'request';
import { expect } from 'chai';

const baseUrl = `http://localhost:5000`;
describe('App Endpoints', () => {
  beforeEach(() => {});

  afterEach(() => {});

  describe('getStatus', () => {
    it('should return the app status', (done) => {
      request.get(`${baseUrl}/status`, {}, (err, response) => {
        if (err) {
          done(err);
          return;
        }

        const data = JSON.parse(response.body);
        expect(data).to.haveOwnProperty('redis');
        expect(data).to.haveOwnProperty('db');
        done();
      });
    });
  });

  describe('getStats', () => {
    it('should return the app stats', (done) => {
      request.get(`${baseUrl}/stats`, {}, (err, response) => {
        if (err) {
          done(err);
          return;
        }

        const data = JSON.parse(response.body);
        expect(data).to.haveOwnProperty('users');
        expect(data).to.haveOwnProperty('files');
        done();
      });
    });
  });
});
