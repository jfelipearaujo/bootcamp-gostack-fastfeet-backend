import { Op } from 'sequelize';
import database from '../../src/database';

export default function truncate() {
  return Promise.all(
    Object.keys(database.connection.models).map(key => {
      if (key === 'User') {
        return database.connection.models[key].destroy({
          where: {
            email: {
              [Op.notIn]: ['admin@fastfeet.com', 'jose@email.com'],
            },
          },
        });
      }

      return database.connection.models[key].destroy({
        truncate: true,
        force: true,
      });
    })
  );
}
