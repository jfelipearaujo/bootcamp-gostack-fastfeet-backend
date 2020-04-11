import request from 'supertest';
import app from '../../../src/app';

import factory from '../../factories';
import truncate from '../../util/truncate';

describe('File', () => {
  let adminToken;
  let commonToken;

  beforeAll(async () => {
    let response = await request(app)
      .post('/sessions')
      .send({
        email: 'admin@fastfeet.com',
        password: '123456',
      });

    adminToken = response.body.token;

    //--

    response = await request(app)
      .post('/sessions')
      .send({
        email: 'jose@email.com',
        password: '123456',
      });

    commonToken = response.body.token;
  });

  beforeEach(async () => {
    await truncate('File');
  });

  it('should not access restricted route', async () => {
    const response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', '__tests__/fixtures/avatar.jpg')
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should upload a file', async () => {
    const imageName = 'avatar.jpg';

    const response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', `__tests__/fixtures/${imageName}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
    expect(response.body.name).toBe(imageName);
  });
});
