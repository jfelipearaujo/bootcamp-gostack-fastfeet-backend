import request from 'supertest';
import app from '../../../src/app';

import truncate from '../../util/truncate';

describe('File', () => {
  beforeEach(async () => {
    await truncate('File');
  });

  it('should upload a file', async () => {
    const imageName = 'avatar.jpg';

    const response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', `__tests__/fixtures/${imageName}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
    expect(response.body.name).toBe(imageName);
  });
});
