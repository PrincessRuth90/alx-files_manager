import request from 'request';
import { expect } from 'chai';

const baseUrl = `http://localhost:5000`;
describe('Users Endpoints', () => {
  let email = '';
  let password = '';
  describe('postNew', () => {
    it('should fail to create with error Missing email', (done) => {
      request.post(
        `${baseUrl}/users`,
        { json: { email, password } },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const data = response.body;
          expect(response.statusCode).to.equal(400);
          expect(data).to.deep.equal({ error: 'Missing email' });
          done();
        },
      );
    });

    it('should fail to create with error Missing password', (done) => {
      email = `test${Date.now()}@app`;
      request.post(
        `${baseUrl}/users`,
        { json: { email, password } },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const data = response.body;
          expect(response.statusCode).to.equal(400);
          expect(data).to.deep.equal({ error: 'Missing password' });
          done();
        },
      );
    });

    it('should create new user', (done) => {
      password = `test`;
      request.post(
        `${baseUrl}/users`,
        { json: { email, password } },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const data = response.body;
          expect(response.statusCode).to.equal(201);
          expect(data).to.haveOwnProperty('id');
          expect(data).to.haveOwnProperty('email');
          done();
        },
      );
    });
  });

  describe('getMe', () => {
    it('should fail with 401', (done) => {
      request.get(`${baseUrl}/users/me`, { headers: {} }, (err, response) => {
        if (err) {
          done(err);
          return;
        }

        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('should login and return current user', (done) => {
      const basic = Buffer.from(`${email}:${password}`).toString('base64');
      request.get(
        `${baseUrl}/connect`,
        { headers: { authorization: `Basic ${basic}` } },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const { token } = JSON.parse(response.body);
          request.get(
            `${baseUrl}/users/me`,
            { headers: { 'x-token': token } },
            (err, response) => {
              if (err) {
                done(err);
                return;
              }

              const data = JSON.parse(response.body);
              expect(response.statusCode).to.equal(200);
              expect(data).to.haveOwnProperty('id');
              expect(data).to.haveOwnProperty('email');
              done();
            },
          );
        },
      );
    });
  });
});
