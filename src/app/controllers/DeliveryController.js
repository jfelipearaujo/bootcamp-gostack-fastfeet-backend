import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import File from '../models/File';

import StartDeliveryService from '../services/StartDeliveryService';
import FinishDeliveryService from '../services/FinishDeliveryService';

class DeliveryController {
  /**
   * List the deliveries of deliveryman
   */
  async index(req, res) {
    const deliveryman_id = req.params.id;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const { page = 1 } = req.query;
    const { delivered = '0' } = req.query;

    let whereOptions;

    if (delivered === '1') {
      whereOptions = {
        deliveryman_id,
        canceled_at: null,
        end_date: {
          [Op.not]: null,
        },
      };
    } else {
      whereOptions = {
        deliveryman_id,
        canceled_at: null,
        end_date: null,
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
      where: whereOptions,
      order: [['id', 'ASC']],
    });

    return res.json(packages);
  }

  /**
   * Start a delivery
   */
  async start(req, res) {
    const deliveryman_id = req.params.id;
    const { package_id } = req.body;

    try {
      const packageData = await StartDeliveryService.run({
        deliveryman_id,
        package_id,
      });

      return res.json(packageData);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  /**
   * Finish a delivery
   */
  async finish(req, res) {
    const deliveryman_id = req.params.id;
    const { package_id, signature_id } = req.body;

    try {
      const packageData = await FinishDeliveryService.run({
        deliveryman_id,
        signature_id,
        package_id,
      });

      return res.json(packageData);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new DeliveryController();
