import request from 'request';
import { expect } from 'chai';

const baseUrl = `http://localhost:5000`;

describe('Files Endpoint', () => {
  let token = '';
  before((done) => {
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
            token = data.token;
            done();
          },
        );
      },
    );
  });

  describe('postUpload', () => {
    it('should fail with 401 no token', (done) => {
      request.post(`${baseUrl}/files`, { json: {} }, (err, response) => {
        if (err) {
          done(err);
          return;
        }

        expect(response.statusCode).to.equal(401);
        done();
      });
    });

    it('should fail with 400 Missing name', (done) => {
      request.post(
        `${baseUrl}/files`,
        { headers: { 'x-token': token }, json: {} },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const data = response.body;
          expect(response.statusCode).to.equal(400);
          expect(data).to.deep.equal({ error: 'Missing name' });
          done();
        },
      );
    });

    it('should fail with 400 Missing type', (done) => {
      request.post(
        `${baseUrl}/files`,
        { headers: { 'x-token': token }, json: { name: 'test.txt' } },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const data = response.body;
          expect(response.statusCode).to.equal(400);
          expect(data).to.deep.equal({ error: 'Missing type' });
          done();
        },
      );
    });

    it('should fail with 400 Missing data', (done) => {
      request.post(
        `${baseUrl}/files`,
        {
          headers: { 'x-token': token },
          json: { name: 'test.txt', type: 'file' },
        },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const data = response.body;
          expect(response.statusCode).to.equal(400);
          expect(data).to.deep.equal({ error: 'Missing data' });
          done();
        },
      );
    });

    it('should fail with 400 Parent not found', (done) => {
      request.post(
        `${baseUrl}/files`,
        {
          headers: { 'x-token': token },
          json: {
            name: 'test.txt',
            type: 'file',
            data: 'test',
            parentId: '0472562e458d8e3d4cd6ae50',
          },
        },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const data = response.body;
          expect(response.statusCode).to.equal(400);
          expect(data).to.deep.equal({ error: 'Parent not found' });
          done();
        },
      );
    });

    it('should create a folder', (done) => {
      request.post(
        `${baseUrl}/files`,
        {
          headers: { 'x-token': token },
          json: {
            name: `docs_${Date.now()}`,
            type: 'folder',
          },
        },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const data = response.body;
          expect(response.statusCode).to.equal(201);
          expect(data).to.haveOwnProperty('id');
          expect(data).to.haveOwnProperty('name');
          expect(data).to.haveOwnProperty('type');
          done();
        },
      );
    });

    it('should create a file', (done) => {
      request.post(
        `${baseUrl}/files`,
        {
          headers: { 'x-token': token },
          json: {
            name: `text_${Date.now()}.txt`,
            type: 'file',
            data: 'testing',
          },
        },
        (err, response) => {
          if (err) {
            done(err);
            return;
          }

          const data = response.body;
          expect(response.statusCode).to.equal(201);
          expect(data).to.haveOwnProperty('id');
          expect(data).to.haveOwnProperty('name');
          expect(data).to.haveOwnProperty('type');
          done();
        },
      );
    });
  });
});
