import request from 'supertest';
import app from '../../../src/app';

import factory from '../../factories';

describe('Delivery', () => {
  let adminToken;

  beforeAll(async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'admin@fastfeet.com',
        password: '123456',
      });

    adminToken = response.body.token;
  });

  it('should not return the deliveries with an deliveryman thats not exists', async () => {
    const response = await request(app).get(`/deliveryman/${1}/deliveries`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Deliveryman not found');
  });

  it('should return the deliveries', async () => {
    // **** Arrange **** //
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

    const numOfEntities = 20;
    const entities = await factory.attrsMany('Package', numOfEntities, {
      recipient_id,
      deliveryman_id,
    });

    const promises = entities.map(async entity => {
      await request(app)
        .post('/packages')
        .send(entity)
        .set('Authorization', `Bearer ${adminToken}`);
    });

    await Promise.all(promises);
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app).get(
      `/deliveryman/${deliveryman_id}/deliveries`
    );
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(numOfEntities);
    // **** Assert **** //
  });

  it('should return only finished deliveries', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
      });

    expect(response.status).toBe(200);

    response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', `__tests__/fixtures/signature.png`);

    expect(response.status).toBe(200);

    const signature_id = response.body.id;

    response = await request(app)
      .put(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
        signature_id,
      });

    expect(response.status).toBe(200);
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app).get(
      `/deliveryman/${deliveryman_id}/deliveries?delivered=1`
    );
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    // **** Assert **** //
  });

  it('should start a delivery', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(200);
    // **** Assert **** //
  });

  it('should finish a delivery', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
      });

    expect(response.status).toBe(200);

    response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', `__tests__/fixtures/signature.png`);

    expect(response.status).toBe(200);

    const signature_id = response.body.id;

    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .put(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
        signature_id,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(200);
    // **** Assert **** //
  });

  it('should not start a delivery when deliveryman is not found', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .post(`/deliveryman/${deliveryman_id + 1}/deliveries`)
      .send({
        package_id,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Deliveryman not found');
    // **** Assert **** //
  });

  it('should not start a delivery when package is not found', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id: package_id + 1,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Package not found');
    // **** Assert **** //
  });

  it('should not start a delivery already started', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
      });

    expect(response.status).toBe(200);
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Delivery already started');
    // **** Assert **** //
  });

  it('should not finish a delivery when deliveryman is not found', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
      });

    expect(response.status).toBe(200);

    response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', `__tests__/fixtures/signature.png`);

    expect(response.status).toBe(200);

    const signature_id = response.body.id;

    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .put(`/deliveryman/${deliveryman_id + 1}/deliveries`)
      .send({
        package_id,
        signature_id,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Deliveryman not found');
    // **** Assert **** //
  });

  it('should not finish a delivery when signature is not found', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
      });

    expect(response.status).toBe(200);

    response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', `__tests__/fixtures/signature.png`);

    expect(response.status).toBe(200);

    const signature_id = response.body.id;

    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .put(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
        signature_id: signature_id + 1,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Signature picture not found');
    // **** Assert **** //
  });

  it('should not finish a delivery when package is not found', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
      });

    expect(response.status).toBe(200);

    response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', `__tests__/fixtures/signature.png`);

    expect(response.status).toBe(200);

    const signature_id = response.body.id;

    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .put(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id: package_id + 1,
        signature_id,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Package not found');
    // **** Assert **** //
  });

  it('should finish a delivery already finished', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    response = await request(app)
      .post(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
      });

    expect(response.status).toBe(200);

    response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', `__tests__/fixtures/signature.png`);

    expect(response.status).toBe(200);

    const signature_id = response.body.id;

    response = await request(app)
      .put(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
        signature_id,
      });

    expect(response.status).toBe(200);
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .put(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
        signature_id,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Delivery already finalized');
    // **** Assert **** //
  });

  it('should not finish a non started delivery', async () => {
    // **** Arrange **** //
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

    response = await request(app)
      .post('/packages')
      .send(
        await factory.attrs('Package', {
          recipient_id,
          deliveryman_id,
        })
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const package_id = response.body.id;

    response = await request(app)
      .post('/files')
      .field('name', 'avatarImage')
      .attach('file', `__tests__/fixtures/signature.png`);

    expect(response.status).toBe(200);

    const signature_id = response.body.id;

    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .put(`/deliveryman/${deliveryman_id}/deliveries`)
      .send({
        package_id,
        signature_id,
      });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'Delivery not started - Impossible to finalize it'
    );
    // **** Assert **** //
  });
});
