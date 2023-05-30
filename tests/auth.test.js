import request from 'request';
import { expect } from 'chai';

const baseUrl = `http://localhost:5000`;
describe('Auth Endpoints', () => {
  let token;
  describe('getConnect', () => {
    it('should fail with status 401 no auth', (done) => {
      request.get(`${baseUrl}/connect`, { headers: {} }, (err, response) => {
        if (err) {
          done(err);
          return;
        }

        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('should fail with status 401 invalid auth', (done) => {
      const basic = Buffer.from(`no@test:test`).toString('base64');
      request.get(`${baseUrl}/connect`, { headers: {} }, (err, response) => {
        if (err) {
          done(err);
          return;
        }

        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('should login', (done) => {
      const email = `test${Date.now()}@app`;
      const password = `test`;
      request.post(
        `${baseUrl}/users`,
        { json: { email, password } },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const basic = Buffer.from(`${email}:${password}`).toString('base64');
          request.get(
            `${baseUrl}/connect`,
            { headers: { authorization: `Basic ${basic}` } },
            (err, response) => {
              if (err) {
                done(err);
                return;
              }

              const data = JSON.parse(response.body);
              expect(data).to.haveOwnProperty('token');
              token = data.token;
              done();
            },
          );
        },
      );
    });
  });
  describe('getDisconnect', () => {
    it('should fail to logout', (done) => {
      request.get(`${baseUrl}/disconnect`, { headers: {} }, (err, response) => {
        if (err) {
          done(err);
          return;
        }

        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('should logout', (done) => {
      request.get(
        `${baseUrl}/disconnect`,
        { headers: { 'x-token': token } },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          expect(response.statusCode).to.equal(204);
          done();
        },
      );
    });
  });
});
