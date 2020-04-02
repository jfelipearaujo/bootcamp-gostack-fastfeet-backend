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

    const { page = 1, product = '' } = req.query;

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
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'city', 'state'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
      where: {
        product: {
          [Op.iLike]: `%${product}%`,
        },
      },
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
    const recipient = await Recipient.findByPk({ where: recipient_id });

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Check if the deliveryman exists
    const deliveryman = await Deliveryman.findByPk({ where: deliveryman_id });

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const start_date = new Date();

    const { id } = await Package.create({
      product,
      recipient_id,
      deliveryman_id,
      start_date,
    });

    // Send an e-mail to the deliveryman about the new package ready to delivery
    await Queue.add(PackageMail.key, {
      deliveryman,
      product,
    });

    return res.json({ id, product, recipient_id, deliveryman_id, start_date });
  }

  /**
   * Alter the content of an entity - Only Admins can execute this route
   */
  async update(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const {
      package_id,
      product = null,
      recipient_id = null,
      deliveryman_id = null,
      canceled_at = null,
      start_date = null,
      end_date = null,
    } = req.body;

    const packageData = await Package.findByPk({ where: { id: package_id } });

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Check if the user wants to change the recipient, if yes check if the recipient exists
    if (packageData.recipient_id !== recipient_id) {
      const recipient = await Recipient.findByPk({ where: recipient_id });

      if (!recipient) {
        return res.status(404).json({ error: 'New recipient not found' });
      }
    }

    // Check if the user wants to change the deliveryman, if yes check if the recipient exists
    if (packageData.deliveryman_id !== deliveryman_id) {
      const deliveryman = await Deliveryman.findByPk({ where: deliveryman_id });

      if (!deliveryman) {
        return res.status(404).json({ error: 'New deliveryman not found' });
      }
    }

    await Package.update(
      {
        product: !product ? packageData.product : product,
        recipient_id: !recipient_id ? packageData.recipient_id : recipient_id,
        deliveryman_id: !deliveryman_id
          ? packageData.deliveryman_id
          : deliveryman_id,
        canceled_at: !canceled_at ? packageData.canceled_at : canceled_at,
        start_date: !start_date ? packageData.start_date : start_date,
        end_date: !end_date ? packageData.end_date : end_date,
      },
      {
        where: { id: package_id },
      }
    );

    return res.json({
      package_id,
      product,
      recipient_id,
      deliveryman_id,
      canceled_at,
      start_date,
      end_date,
    });
  }

  /**
   * Delete an entity - Only Admins can execute this route
   */
  async delete(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { package_id } = req.body;

    if (!package_id) {
      return res.status(400).json({ error: 'Package id not provided' });
    }

    const packageData = await Package.findByPk(package_id);

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    await Package.destroy({ where: { id: package_id } });

    return res.json({ ok: 'Package deleted' });
  }
}

export default new PackageController();
