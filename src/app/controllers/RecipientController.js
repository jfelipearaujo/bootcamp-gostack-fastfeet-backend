import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  /**
   * Returns at least 20 entities - Only Admins can execute this route
   */
  async index(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { page = 1 } = req.query;

    const recipients = await Recipient.findAll({
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(recipients);
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
      street: Yup.string().required(),
      number: Yup.number().required(),
      complement: Yup.string(),
      state: Yup.string()
        .required()
        .min(2)
        .max(2),
      city: Yup.string().required(),
      cep: Yup.string()
        .required()
        .min(8)
        .max(8),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
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

    return res.json({ id, street, number, complement, state, city, cep });
  }

  /**
   * Alter the content of an entity - Only Admins can execute this route
   */
  async update(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      complement: Yup.string(),
      state: Yup.string()
        .min(2)
        .max(2),
      city: Yup.string(),
      cep: Yup.string()
        .required()
        .min(8)
        .max(8),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { name, cep, street, number, complement, state, city } = req.body;

    const recipient = await Recipient.findOne({ where: { name, cep } });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

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

    const { recipient_id } = req.body;

    if (!recipient_id) {
      return res.status(400).json({ error: 'Recipient id not provided' });
    }

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    await Recipient.destroy({ where: { id: recipient_id } });

    return res.json({ ok: 'Recipient deleted' });
  }
}

export default new RecipientController();
