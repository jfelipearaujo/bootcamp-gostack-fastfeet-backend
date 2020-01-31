import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  /**
   * Returns at least 20 users - Only Admins can execute this route
   */
  async index(req, res) {
    try {
      if (!req.isAdmin) {
        return res.status(401).json({ error: 'Access denied' });
      }

      const { page = 1 } = req.query;

      const users = await User.findAll({
        limit: 20,
        offset: (page - 1) * 20,
      });

      return res.json(users);
    } catch (ex) {
      return res.stats(500).json({ error: 'Unespected error', details: ex });
    }
  }

  /**
   * Create a user - Everyone can execute this route
   */
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string()
          .email()
          .required(),
        password: Yup.string()
          .required()
          .min(6),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      const userExists = await User.findOne({
        where: { email: req.body.email },
      });

      if (userExists) {
        return res.status(400).json({ error: 'E-mail already exists' });
      }

      const { id, name, email, is_admin } = await User.create(req.body);

      return res.json({ id, name, email, is_admin });
    } catch (ex) {
      return res.stats(500).json({ error: 'Unespected error', details: ex });
    }
  }

  /**
   * Alter the data of an user - Everyone can execute this route
   */
  async update(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string(),
        email: Yup.string().email(),
        password: Yup.string()
          .min(6)
          .when('oldPassword', (oldPassword, field) =>
            oldPassword ? field.required() : field
          ),
        confirmPassword: Yup.string().when('password', (password, field) =>
          password ? field.required().oneOf([Yup.ref('password')]) : field
        ),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validation fails' });
      }

      const { email, oldPassword } = req.body;

      const user = await User.findByPk(req.userId);

      /**
       * Validate if the users wants to change their email, if yes: check if exists
       */
      if (email && email !== user.email) {
        const userExists = await User.findOne({ where: email });

        if (userExists) {
          return res.status(400).json({ error: 'E-mail already exists' });
        }
      }

      /**
       * Validade if the users informed the correct password before change it
       */
      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ error: 'The old password is invalid' });
      }

      const { id, name, is_admin } = await User.update(req.body);

      return res.json({ id, name, email, is_admin });
    } catch (ex) {
      return res.stats(500).json({ error: 'Unespected error', details: ex });
    }
  }

  /**
   * Delete a user - Only Admins can execute this route
   */
  async delete(req, res) {
    try {
      if (!req.isAdmin) {
        return res.status(401).json({ error: 'Access denied' });
      }

      const { user_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'User id not provided' });
      }

      const user = await User.findByPk(user_id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user_id === req.userId) {
        return res.status(400).json({ error: 'User cannot delete it himself' });
      }

      await User.destroy({ where: { id: user_id } });

      return res.json();
    } catch (ex) {
      return res.stats(500).json({ error: 'Unespected error', details: ex });
    }
  }
}

export default new UserController();
