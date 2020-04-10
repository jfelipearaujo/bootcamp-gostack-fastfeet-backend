import faker from 'faker';
import { factory } from 'factory-girl';

import User from '../src/app/models/User';
import Recipient from '../src/app/models/Recipient';

factory.define('User', User, () => ({
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
}));

factory.define('Recipient', Recipient, () => ({
  name: faker.name.findName(),
  street: faker.address.streetName(),
  number: faker.random.number(1, 100),
  complement: faker.lorem.words(5),
  state: faker.address.stateAbbr(),
  city: faker.address.city(),
  cep: faker.random.alphaNumeric(8),
}));

export default factory;
