import request from 'supertest';
import app from '../../../src/app';

import factory from '../../factories';
import truncate from '../../util/truncate';

describe('Recipient', () => {
  const baseUrl = '/recipients';
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
    await truncate('Recipient');
  });

  it('should not allow to access a restricted get route', async () => {
    const response = await request(app)
      .get(baseUrl)
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not allow to access a restricted post route', async () => {
    const recipient = await factory.attrs('Recipient');

    const response = await request(app)
      .post(baseUrl)
      .send(recipient)
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not allow to access a restricted put route', async () => {
    const recipient = await factory.attrs('Recipient');

    const response = await request(app)
      .put('/recipients/1')
      .send(recipient)
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not allow to access a restricted delete route', async () => {
    const response = await request(app)
      .delete('/recipients/1')
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should create a recipient', async () => {
    const recipient = await factory.attrs('Recipient');

    const response = await request(app)
      .post(baseUrl)
      .send(recipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.body).toHaveProperty('id');
  });

  it('should not create a recipient with same name and cep', async () => {
    let recipient = await factory.attrs('Recipient');

    let response = await request(app)
      .post(baseUrl)
      .send(recipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { name, cep } = response.body;

    recipient = await factory.attrs('Recipient', {
      name,
      cep,
    });

    response = await request(app)
      .post(baseUrl)
      .send(recipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('should not update a not recipient thats not exists', async () => {
    const recipient = await factory.attrs('Recipient');

    const response = await request(app)
      .put(baseUrl)
      .send(recipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should not update a recipient with name and cep thats already exists', async () => {
    let recipient = await factory.attrs('Recipient');

    let response = await request(app)
      .post(baseUrl)
      .send(recipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { id } = response.body;

    //------

    recipient = await factory.attrs('Recipient');

    response = await request(app)
      .post(baseUrl)
      .send(recipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { name, cep } = response.body;

    response = await request(app)
      .put(`/recipients/${id}`)
      .send({
        name,
        cep,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('should update a recipient', async () => {
    const recipient = await factory.attrs('Recipient');

    let response = await request(app)
      .post(baseUrl)
      .send(recipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { id, name, cep } = response.body;

    const newRecipient = await factory.attrs('Recipient', {
      name,
      cep,
    });

    response = await request(app)
      .put(`/recipients/${id}`)
      .send(newRecipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should return an error if the recipient is not found when try to update', async () => {
    const recipient = await factory.attrs('Recipient');

    const response = await request(app)
      .put(`/recipients/${9999}`)
      .send(recipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should delete a recipient', async () => {
    const recipient = await factory.attrs('Recipient');

    let response = await request(app)
      .post(baseUrl)
      .send(recipient)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { id } = response.body;

    response = await request(app)
      .delete(`/recipients/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should return an error if the recipient is not found when try to delete', async () => {
    const response = await request(app)
      .delete(`/recipients/${9999}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should return max 20 recipients', async () => {
    const expectedRecipientCount = 20;
    const numOfRecipients = 30;
    const recipients = await factory.attrsMany('Recipient', numOfRecipients);

    const promises = recipients.map(async recipient => {
      await request(app)
        .post(baseUrl)
        .send(recipient)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    await Promise.all(promises);

    const response = await request(app)
      .get(baseUrl)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(expectedRecipientCount);
  });
});
