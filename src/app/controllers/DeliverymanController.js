import * as Yup from 'yup';
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

    const { page = 1, name = '' } = req.query;

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
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
      },
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

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const deliverymen = await Deliveryman.findOne({ where: { email } });

    if (deliverymen) {
      return res.status(400).json({ error: 'E-mail already exists' });
    }

    const { id, name } = await Deliveryman.create(req.body);

    return res.json({ id, name, email });
  }

  /**
   * Alter the content of an entity - Only Admins can execute this route
   */
  async update(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { name, email } = req.body;

    const deliveryman = await Deliveryman.findOne({ where: { email } });

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    /**
     * Validate if the deliveryman wants to change the name, if yes: check if exists
     */
    if (
      (name && name !== deliveryman.name) ||
      (email && email !== deliveryman.email)
    ) {
      const deliverymanExists = await Deliveryman.findOne({
        where: { email },
      });

      if (deliverymanExists) {
        return res.status(400).json({ error: 'E-mail already exists' });
      }
    }

    await Deliveryman.update(req.body, {
      where: { id: deliveryman.id },
    });

    return res.json({
      id: deliveryman.id,
      name,
      email,
    });
  }

  /**
   * Delete an entity - Only Admins can execute this route
   */
  async delete(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { deliveryman_id } = req.body;

    if (!deliveryman_id) {
      return res.status(400).json({ error: 'Deliveryman id not provided' });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    await Deliveryman.destroy({ where: { id: deliveryman_id } });

    return res.json({ ok: 'Deliveryman deleted' });
  }
}

export default new DeliverymanController();
