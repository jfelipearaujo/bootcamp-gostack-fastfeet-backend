import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
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

    const recipients = await Recipient.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: [
        'id',
        'name',
        'street',
        'number',
        'city',
        'state',
        'address',
      ],
      where: whereConditional,
    });

    return res.status(200).json(recipients);
  }

  /**
   * Create an entity - Only Admins can execute this route
   */
  async store(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { name, cep } = req.body;

    const recipientExists = await Recipient.findOne({ where: { name, cep } });

    if (recipientExists) {
      return res.status(400).json({ error: 'Name and CEP already exists' });
    }

    const {
      id,
      street,
      number,
      complement = null,
      state,
      city,
    } = await Recipient.create(req.body);

    return res.json({ id, name, street, number, complement, state, city, cep });
  }

  /**
   * Alter the content of an entity - Only Admins can execute this route
   */
  async update(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(404).json({ error: `Recipient not found ${id}` });
    }

    const { name, cep, street, number, complement, state, city } = req.body;

    /**
     * Validate if the recipient wants to change the name, if yes: check if exists
     */
    if ((name && name !== recipient.name) || (cep && cep !== recipient.cep)) {
      const recipientExists = await Recipient.findOne({
        where: { name, cep },
      });

      if (recipientExists) {
        return res.status(400).json({ error: 'Name and CEP already exists' });
      }
    }

    await Recipient.update(req.body, {
      where: { id: recipient.id },
    });

    return res.json({
      id: recipient.id,
      name,
      street,
      number,
      complement,
      state,
      city,
      cep,
    });
  }

  /**
   * Delete an entity - Only Admins can execute this route
   */
  async delete(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    await Recipient.destroy({ where: { id } });

    return res.json({ ok: 'Recipient deleted' });
  }
}

export default new RecipientController();
