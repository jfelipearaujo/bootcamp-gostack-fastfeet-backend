import request from 'supertest';
import app from '../../../src/app';

import factory from '../../factories';
import truncate from '../../util/truncate';

describe('DeliveryProblem', () => {
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
    await truncate('DeliveryProblem');
  });

  it('should not access restricted get route', async () => {
    const response = await request(app)
      .get('/delivery/problems')
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not access restricted delete route', async () => {
    const response = await request(app)
      .delete('/problem/1/cancel-delivery')
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should return delivery problems', async () => {
    // **** Arrange **** //

    // Create the recipient
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    // Create the deliveryman
    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    // Creathe the package
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

    //----

    // Create a delivery problem
    response = await request(app)
      .post(`/delivery/${package_id}/problems`)
      .send({ description: 'Deu problema' });

    expect(response.status).toBe(200);
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .get('/delivery/problems')
      .set('Authorization', `Bearer ${adminToken}`);
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    // **** Assert **** //
  });

  it('should return delivery problems from a specific delivery', async () => {
    // **** Arrange **** //

    // Create the recipient
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    // Create the deliveryman
    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    // Creathe the package
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

    //----

    // Create a delivery problem
    response = await request(app)
      .post(`/delivery/${package_id}/problems`)
      .send({ description: 'Deu problema' });

    expect(response.status).toBe(200);
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app).get(`/delivery/${package_id}/problems`);
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    // **** Assert **** //
  });

  it('should not return delivery problems from a delivery thats not exists', async () => {
    // **** Arrange **** //

    // Create the recipient
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    // Create the deliveryman
    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    // Creathe the package
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

    //----

    // Create a delivery problem
    response = await request(app)
      .post(`/delivery/${package_id}/problems`)
      .send({ description: 'Deu problema' });

    expect(response.status).toBe(200);
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app).get(`/delivery/${package_id + 1}/problems`);
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(404);
    // **** Assert **** //
  });

  it('should create a delivery problems', async () => {
    // **** Arrange **** //

    // Create the recipient
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    // Create the deliveryman
    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    // Creathe the package
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
      .post(`/delivery/${package_id}/problems`)
      .send({ description: 'Deu problema' });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(200);
    // **** Assert **** //
  });

  it('should not create a delivery problems without a description', async () => {
    // **** Arrange **** //

    // Create the recipient
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    // Create the deliveryman
    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    // Creathe the package
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
    response = await request(app).post(`/delivery/${package_id}/problems`);
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    // **** Assert **** //
  });

  it('should not create a delivery problems from a delivery thats not exists', async () => {
    // **** Arrange **** //

    // Create the recipient
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    // Create the deliveryman
    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    // Creathe the package
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
      .post(`/delivery/${package_id + 1}/problems`)
      .send({ description: 'Deu problema' });
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(404);
    // **** Assert **** //
  });

  it('should cancel a delivery', async () => {
    // **** Arrange **** //

    // Create the recipient
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    // Create the deliveryman
    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    // Creathe the package
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
      .post(`/delivery/${package_id}/problems`)
      .send({ description: 'Deu problema' });

    expect(response.status).toBe(200);

    const delivery_problem_id = response.body.id;
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .delete(`/problem/${delivery_problem_id}/cancel-delivery`)
      .set('Authorization', `Bearer ${adminToken}`);
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(200);
    // **** Assert **** //
  });

  it('should not cancel a delivery thats not exists', async () => {
    // **** Arrange **** //

    // Create the recipient
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    // Create the deliveryman
    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    // Creathe the package
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
      .post(`/delivery/${package_id}/problems`)
      .send({ description: 'Deu problema' });

    expect(response.status).toBe(200);

    const delivery_problem_id = response.body.id;
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .delete(`/problem/${delivery_problem_id + 1}/cancel-delivery`)
      .set('Authorization', `Bearer ${adminToken}`);
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(404);
    // **** Assert **** //
  });

  it('should not cancel a delivery thats been already cancelled', async () => {
    // **** Arrange **** //

    // Create the recipient
    let response = await request(app)
      .post('/recipients')
      .send(await factory.attrs('Recipient'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const recipient_id = response.body.id;

    //----

    // Create the deliveryman
    response = await request(app)
      .post('/deliveryman')
      .send(await factory.attrs('Deliveryman'))
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);

    const deliveryman_id = response.body.id;

    //----

    // Creathe the package
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
      .post(`/delivery/${package_id}/problems`)
      .send({ description: 'Deu problema' });

    expect(response.status).toBe(200);

    const delivery_problem_id = response.body.id;

    response = await request(app)
      .delete(`/problem/${delivery_problem_id}/cancel-delivery`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    // **** Arrange **** //

    // **** Act **** //
    response = await request(app)
      .delete(`/problem/${delivery_problem_id}/cancel-delivery`)
      .set('Authorization', `Bearer ${adminToken}`);
    // **** Act **** //

    // **** Assert **** //
    expect(response.status).toBe(400);
    // **** Assert **** //
  });
});
