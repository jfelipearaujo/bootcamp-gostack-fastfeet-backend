import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../../src/app';

import factory from '../../factories';
import truncate from '../../util/truncate';

describe('User', () => {
  const dummyUsers = 2; // This is used to represent the Admin and Common users created with Sequelize Seeder
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
    await truncate('User');
  });

  it('should encrypt user password when new user is created', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });

    const compareHash = await bcrypt.compare('123456', user.password_hash);

    expect(compareHash).toBeTruthy();
  });

  it('should return validtion error when try to create an user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Teste',
        email: 'email@email.com',
      });

    expect(response.status).toBe(400);
  });

  it('should be able to register', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register with duplicated email', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should return all users', async () => {
    const numOfUsers = 5;
    const users = await factory.attrsMany('User', numOfUsers);

    const promises = users.map(async user => {
      await request(app)
        .post('/users')
        .send(user);
    });

    await Promise.all(promises);

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(users.length + dummyUsers);
  });

  it('should not allow a commom user to access a restricted route', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should return max 20 users', async () => {
    const expectedUserCount = 20;
    const numOfUsers = 30;
    const users = await factory.attrsMany('User', numOfUsers);

    const promises = users.map(async user => {
      await request(app)
        .post('/users')
        .send(user);
    });

    await Promise.all(promises);

    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(expectedUserCount);
  });

  it('should be able to update an user', async () => {
    const expectedUserName = 'Jose Felipe';

    const response = await request(app)
      .put('/users')
      .send({
        name: expectedUserName,
        email: 'jose@email.com',
        password: '123456',
        confirmPassword: '123456',
      })
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe(expectedUserName);
  });

  it('should return validtion error when try to update an user', async () => {
    const expectedUserName = 'Jose Felipe';

    const response = await request(app)
      .put('/users')
      .send({
        name: expectedUserName,
        email: 'jose@email.com',
        oldPassword: '123456',
        password: '12345678',
      })
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(400);
  });

  it('should not be able to update an user with an existing email', async () => {
    const response = await request(app)
      .put('/users')
      .send({
        email: 'admin@fastfeet.com',
        password: '123456',
        confirmPassword: '123456',
      })
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(400);
  });

  it('should not be able to update an user with an incorrect old password', async () => {
    const response = await request(app)
      .put('/users')
      .send({
        email: 'jose@email.com',
        oldPassword: '123456XX',
        password: '123456',
        confirmPassword: '123456',
      })
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not be able to update an user with an incorrect new password', async () => {
    const response = await request(app)
      .put('/users')
      .send({
        email: 'jose@email.com',
        oldPassword: '123456',
        password: '123456',
        confirmPassword: '12345678',
      })
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(400);
  });

  it('should not be able to access the delete route if isnt an admin', async () => {
    const response = await request(app)
      .delete('/users')
      .send({
        user_id: 2,
      })
      .set('Authorization', `Bearer ${commonToken}`);

    expect(response.status).toBe(401);
  });

  it('should not be able to delete if userId wasnt provided', async () => {
    const response = await request(app)
      .delete('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('should not be able to delete a user that not exists', async () => {
    const response = await request(app)
      .delete('/users')
      .send({
        user_id: 5000,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it('should not be able to delete himself', async () => {
    const response = await request(app)
      .delete('/users')
      .send({
        user_id: 1,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it('should be able to delete an user', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    const deleteResponse = await request(app)
      .delete('/users')
      .send({
        user_id: response.body.id,
      })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteResponse.status).toBe(200);
  });

  it('should return error when token is not provided', async () => {
    const response = await request(app)
      .delete('/users')
      .send({
        user_id: 1,
      });

    expect(response.status).toBe(401);
  });

  it('should return error when token is invalid', async () => {
    const response = await request(app)
      .delete('/users')
      .send({
        user_id: 1,
      })
      .set('Authorization', `Bearer ${`${adminToken}aa`}`);

    expect(response.status).toBe(401);
  });
});
