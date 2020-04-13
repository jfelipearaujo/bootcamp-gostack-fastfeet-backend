import request from 'supertest';
import app from '../../../src/app';
import truncate from '../../util/truncate';

describe('Session', () => {
  const baseUrl = '/sessions';

  beforeEach(async () => {
    await truncate('User');
  });

  it('should return validation error', async () => {
    const response = await request(app)
      .post(baseUrl)
      .send({
        email: 'naoexiste@email.com',
      });

    expect(response.status).toBe(400);
  });

  it('should return error if user is not found', async () => {
    const response = await request(app)
      .post(baseUrl)
      .send({
        email: 'naoexiste@email.com',
        password: '123456',
      });

    expect(response.status).toBe(404);
  });

  it('should return error if password is incorrect', async () => {
    const response = await request(app)
      .post(baseUrl)
      .send({
        email: 'admin@fastfeet.com',
        password: '12345678',
      });

    expect(response.status).toBe(401);
  });
});
