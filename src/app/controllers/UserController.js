import User from '../models/User';

class UserController {
  async index(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { page = 1 } = req.query;

    const users = await User.findAll({
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(users);
  }

  async store(req, res) {
    const userExists = await User.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(400).json({ error: 'E-mail already exists' });
    }

    const { id, name, email, is_admin } = await User.create(req.body);

    return res.json({ id, name, email, is_admin });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    /**
     * Validate if the users wants to change their email, if yes: check if exists
     */
    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

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

    const { id, name, is_admin } = await user.update(req.body);

    return res.json({ id, name, email, is_admin });
  }

  async delete(req, res) {
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
  }
}

export default new UserController();
