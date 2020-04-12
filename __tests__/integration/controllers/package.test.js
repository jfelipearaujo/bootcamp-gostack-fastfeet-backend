import request from 'supertest';
import app from '../../../src/app';

import factory from '../../factories';
import truncate from '../../util/truncate';

describe('Package', () => {
  const baseUrl = '/packages';
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
    await truncate('Package');
  });

  it('should not allow to access a restricted get route', async () => {
    const response = await request(app)
      .get(baseUrl)
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not allow to access a restricted post route', async () => {
    const entity = await factory.attrs('Package');

    const response = await request(app)
      .post(baseUrl)
      .send(entity)
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not allow to access a restricted put route', async () => {
    const entity = await factory.attrs('Package');

    const response = await request(app)
      .put('/packages/1')
      .send(entity)
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not allow to access a restricted delete route', async () => {
    const response = await request(app)
      .delete('/packages/1')
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not create a package with a recipient thats not exists', async () => {
    const entity = await factory.attrs('Package', {
      package_id: 0,
    });

    const response = await request(app)
      .post(baseUrl)
      .send(entity)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should not create a package with a deliveryman thats not exists', async () => {
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.body).toHaveProperty('id');

    const recipient_id = response.body.id;

    //----

    const entity = await factory.attrs('Package', {
      recipient_id,
      deliveryman_id: 0,
    });

    response = await request(app)
      .post(baseUrl)
      .send(entity)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should create a package', async () => {
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    const entity = await factory.attrs('Package', {
      recipient_id,
      deliveryman_id,
    });

    response = await request(app)
      .post(baseUrl)
      .send(entity)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should update a package', async () => {
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    const entity = await factory.attrs('Package', {
      recipient_id,
      deliveryman_id,
    });

    response = await request(app)
      .post(baseUrl)
      .send(entity)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    //----

    const expectedProductName = 'iPhone';

    response = await request(app)
      .put(`${baseUrl}/${package_id}`)
      .send({
        product: expectedProductName,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.product).toBe(expectedProductName);
  });

  it('should not update a package with a recipient thats not exists', async () => {
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    const entity = await factory.attrs('Package', {
      recipient_id,
      deliveryman_id,
    });

    response = await request(app)
      .post(baseUrl)
      .send(entity)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    //----

    response = await request(app)
      .put(`${baseUrl}/${package_id}`)
      .send({
        recipient_id: recipient_id + 1,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should not update a package with a deliveryman thats not exists', async () => {
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    const entity = await factory.attrs('Package', {
      recipient_id,
      deliveryman_id,
    });

    response = await request(app)
      .post(baseUrl)
      .send(entity)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    //----

    response = await request(app)
      .put(`${baseUrl}/${package_id}`)
      .send({
        deliveryman_id: deliveryman_id + 1,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should not update a package thats not exists', async () => {
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    const entity = await factory.attrs('Package', {
      recipient_id,
      deliveryman_id,
    });

    response = await request(app)
      .post(baseUrl)
      .send(entity)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    //----

    const expectedProductName = 'iPhone';

    response = await request(app)
      .put(`${baseUrl}/${package_id + 1}`)
      .send({
        product: expectedProductName,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should delete a package', async () => {
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    const entity = await factory.attrs('Package', {
      recipient_id,
      deliveryman_id,
    });

    response = await request(app)
      .post(baseUrl)
      .send(entity)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    //----

    response = await request(app)
      .delete(`${baseUrl}/${package_id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  it('should not delete a package thats not exists', async () => {
    const response = await request(app)
      .delete(`${baseUrl}/1`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should return max 20 entities', async () => {
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    const expectedEntitiesCount = 20;
    const numOfEntities = 30;
    const entities = await factory.attrsMany('Package', numOfEntities, {
      recipient_id,
      deliveryman_id,
    });

    const promises = entities.map(async entity => {
      await request(app)
        .post(baseUrl)
        .send(entity)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    await Promise.all(promises);

    response = await request(app)
      .get(baseUrl)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(expectedEntitiesCount);
  });
});
