import faker from 'faker';
import { factory } from 'factory-girl';

import User from '../src/app/models/User';
import Recipient from '../src/app/models/Recipient';
import Deliveryman from '../src/app/models/Deliveryman';

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

factory.define('Deliveryman', Deliveryman, () => ({
  name: faker.name.findName(),
  email: faker.internet.email(),
}));

export default factory;
