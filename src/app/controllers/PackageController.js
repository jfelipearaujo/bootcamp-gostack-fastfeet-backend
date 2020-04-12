import { Op } from 'sequelize';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

import PackageMail from '../jobs/PackageMail';
import Queue from '../../lib/Queue';

class PackageController {
  /**
   * Returns at least 20 entities - Only Admins can execute this route
   */
  async index(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { page = 1, p = '' } = req.query;

    let whereConditional;

    if (process.env.NODE_ENV === 'test') {
      whereConditional = {
        product: {
          [Op.like]: `%${p}%`, // SQLite doesnt contains the 'iLike'
        },
      };
    } else {
      whereConditional = {
        product: {
          [Op.iLike]: `%${p}%`,
        },
      };
    }

    const packages = await Package.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
        'delivery_status',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'street', 'number', 'cep', 'city', 'state'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['path', 'url'],
        },
      ],
      where: whereConditional,
      order: [['id', 'ASC']],
    });

    return res.json(packages);
  }

  /**
   * Create an entity - Only Admins can execute this route
   */
  async store(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { product, recipient_id, deliveryman_id } = req.body;

    // Check if the recipient exists
    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Check if the deliveryman exists
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const { id } = await Package.create({
      product,
      recipient_id,
      deliveryman_id,
    });

    // Send an e-mail to the deliveryman about the new package ready to delivery
    if (process.env.NODE_ENV !== 'test') {
      await Queue.add(PackageMail.key, {
        deliveryman,
        product,
      });
    }

    return res.json({ id, product, recipient_id, deliveryman_id });
  }

  /**
   * Alter the content of an entity - Only Admins can execute this route
   */
  async update(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    const { recipient_id, deliveryman_id } = req.body;

    const packageData = await Package.findByPk(id);

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Check if the user wants to change the recipient, if yes check if the recipient exists
    if (recipient_id && packageData.recipient_id !== recipient_id) {
      const recipient = await Recipient.findByPk(recipient_id);

      if (!recipient) {
        return res.status(404).json({ error: 'New recipient not found' });
      }
    }

    // Check if the user wants to change the deliveryman, if yes check if the deliveryman exists
    if (deliveryman_id && packageData.deliveryman_id !== deliveryman_id) {
      const deliveryman = await Deliveryman.findByPk(deliveryman_id);

      if (!deliveryman) {
        return res.status(404).json({ error: 'New deliveryman not found' });
      }
    }

    const packageUpdated = await packageData.update(req.body, {
      where: { id },
    });

    return res.json(packageUpdated);
  }

  /**
   * Delete an entity - Only Admins can execute this route
   */
  async delete(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    const packageData = await Package.findByPk(id);

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    await Package.destroy({ where: { id } });

    return res.json({ ok: 'Package deleted' });
  }
}

export default new PackageController();
