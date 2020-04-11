import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  /**
   * Returns at least 20 entities - Only Admins can execute this route
   */
  async index(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { page = 1, n = '' } = req.query;

    let whereConditional;

    if (process.env.NODE_ENV === 'test') {
      whereConditional = {
        name: {
          [Op.like]: `%${n}%`, // SQLite doesnt contains the 'iLike'
        },
      };
    } else {
      whereConditional = {
        name: {
          [Op.iLike]: `%${n}%`,
        },
      };
    }

    const deliverymen = await Deliveryman.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
      where: whereConditional,
    });

    return res.json(deliverymen);
  }

  /**
   * Create an entity - Only Admins can execute this route
   */
  async store(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { name, email } = req.body;

    const deliverymen = await Deliveryman.findOne({ where: { email } });

    if (deliverymen) {
      return res.status(400).json({ error: 'E-mail already exists' });
    }

    const { id } = await Deliveryman.create(req.body);

    return res.json({ id, name, email });
  }

  /**
   * Alter the content of an entity - Only Admins can execute this route
   */
  async update(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { email } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    /**
     * Validate if the deliveryman wants to change the name, if yes: check if exists
     */
    if (email && email !== deliveryman.email) {
      const deliverymanExists = await Deliveryman.findOne({
        where: { email },
      });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'E-mail already exists' });
      }
    }

    await deliveryman.update(req.body);

    const { name, avatar } = await Deliveryman.findByPk(id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({ id, name, email, avatar });
  }

  /**
   * Delete an entity - Only Admins can execute this route
   */
  async delete(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    await Deliveryman.destroy({ where: { id } });

    return res.json({ ok: 'Deliveryman deleted' });
  }
}

export default new DeliverymanController();
