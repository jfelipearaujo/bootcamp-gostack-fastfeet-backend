import request from 'supertest';
import app from '../../../src/app';

import factory from '../../factories';
import truncate from '../../util/truncate';

describe('Deliveryman', () => {
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
    await truncate('Deliveryman');
  });

  it('should not allow to access a restricted get route', async () => {
    const response = await request(app)
      .get('/deliveryman')
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not allow to access a restricted post route', async () => {
    const deliveryman = await factory.attrs('Deliveryman');

    const response = await request(app)
      .post('/deliveryman')
      .send(deliveryman)
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not allow to access a restricted put route', async () => {
    const deliveryman = await factory.attrs('Deliveryman');

    const response = await request(app)
      .put('/deliveryman/1')
      .send(deliveryman)
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not allow to access a restricted delete route', async () => {
    const response = await request(app)
      .delete('/deliveryman/1')
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should create a deliveryman', async () => {
    const deliveryman = await factory.attrs('Deliveryman');

    const response = await request(app)
      .post('/deliveryman')
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.body).toHaveProperty('id');
  });

  it('should return validation error when try to create', async () => {
    const response = await request(app)
      .post('/deliveryman')
      .send({
        email: 'email@email.com',
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('should not create a deliveryman with an email thats already exists', async () => {
    let deliveryman = await factory.attrs('Deliveryman');

    let response = await request(app)
      .post('/deliveryman')
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { email } = response.body;

    deliveryman = await factory.attrs('Deliveryman', {
      email,
    });

    response = await request(app)
      .post('/deliveryman')
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('should update a deliveryman', async () => {
    let deliveryman = await factory.attrs('Deliveryman');

    let response = await request(app)
      .post('/deliveryman')
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { id, email } = response.body;

    deliveryman = await factory.attrs('Deliveryman', {
      email,
    });

    response = await request(app)
      .put(`/deliveryman/${id}`)
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should return validation error when try to update', async () => {
    let deliveryman = await factory.attrs('Deliveryman');

    let response = await request(app)
      .post('/deliveryman')
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { id } = response.body;

    deliveryman = await factory.attrs('Deliveryman', {
      email: 'jose@email',
    });

    response = await request(app)
      .put(`/deliveryman/${id}`)
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('should not update a deliveryman thats not exists', async () => {
    const deliveryman = await factory.attrs('Deliveryman');

    const response = await request(app)
      .put('/deliveryman/9999')
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should not update a deliveryman with email thats already exists', async () => {
    let deliveryman = await factory.attrs('Deliveryman', {
      email: 'jose@email.com',
    });

    let response = await request(app)
      .post('/deliveryman')
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { id } = response.body;

    //------

    deliveryman = await factory.attrs('Deliveryman', {
      email: 'felipe@email.com',
    });

    response = await request(app)
      .post('/deliveryman')
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { email } = response.body;

    response = await request(app)
      .put(`/deliveryman/${id}`)
      .send({
        email,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('should delete a deliveryman', async () => {
    const deliveryman = await factory.attrs('Deliveryman');

    let response = await request(app)
      .post('/deliveryman')
      .send(deliveryman)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const { id } = response.body;

    response = await request(app)
      .delete(`/deliveryman/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should not delete a deliveryman thats not exists', async () => {
    const response = await request(app)
      .delete('/deliveryman/9999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should return max 20 deliveryman', async () => {
    const expectedCount = 20;
    const numOfEntities = 30;
    const deliverymans = await factory.attrsMany('Deliveryman', numOfEntities);

    const promises = deliverymans.map(async entity => {
      await request(app)
        .post('/deliveryman')
        .send(entity)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    await Promise.all(promises);

    const response = await request(app)
      .get('/deliveryman')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(expectedCount);
  });
});
